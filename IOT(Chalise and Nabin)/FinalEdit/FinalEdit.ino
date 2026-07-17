#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "MAX30100_PulseOximeter.h"

// ==========================================
// 1. SYSTEM & NETWORK CONFIGURATION
// ==========================================
namespace Config {
    // Backend Config
    constexpr const char* WIFI_SSID  = "Galaxy F22";
    constexpr const char* WIFI_PASS  = "11111111";
    constexpr const char* SERVER_URL = "http://192.168.63.47:8000/api/data";
    constexpr const char* DEVICE_ID  = "Chalise-001"; 

    // Hardware Pins
    constexpr uint8_t PIN_MAX_SDA = 6;
    constexpr uint8_t PIN_MAX_SCL = 7;
    constexpr uint8_t PIN_MPU_SDA = 8;
    constexpr uint8_t PIN_MPU_SCL = 9;
    
    constexpr uint8_t PIN_GPS_RX = 16;
    constexpr uint8_t PIN_GPS_TX = 17;
    constexpr uint32_t GPS_BAUD  = 9600;
    constexpr uint8_t PIN_BUZZER = 4;
}

// ==========================================
// 2. GLOBAL STATE
// ==========================================
struct SystemData {
    float heartRate = 0.0;
    uint8_t spO2 = 0;
    bool biometricsOnline = false;

    int16_t accel[3] = {0, 0, 0};
    int16_t gyro[3]  = {0, 0, 0};
    bool imuOnline = false;

    double lat = 0.0, lng = 0.0;
    float speedKmph = 0.0;
    bool gpsLocked = false;
} sysData;

// ==========================================
// 3. HARDWARE ABSTRACTION LAYERS (HAL)
// ==========================================
TinyGPSPlus gpsParser;
HardwareSerial gpsSerial(1);
PulseOximeter pox;

void onPulseDetected() {
    // Medical beep logic can go here if needed
}

// --- IMU MODULE (MPU9250) ---
namespace IMU {
    void writeByte(uint8_t addr, uint8_t reg, uint8_t data) {
        Wire1.beginTransmission(addr);
        Wire1.write(reg);
        Wire1.write(data);
        Wire1.endTransmission();
    }
    void readBytes(uint8_t addr, uint8_t reg, uint8_t count, uint8_t* dest) {
        Wire1.beginTransmission(addr);
        Wire1.write(reg);
        Wire1.endTransmission(false);
        Wire1.requestFrom((int)addr, (int)count);
        for (int i = 0; i < count && Wire1.available(); i++) {
            dest[i] = Wire1.read();
        }
    }
    bool init() {
        Wire1.beginTransmission(0x68);
        if (Wire1.endTransmission() != 0) return false;
        writeByte(0x68, 0x6B, 0x00); delay(10);
        writeByte(0x68, 0x37, 0x02); delay(10);
        return true;
    }
    void update() {
        if (!sysData.imuOnline) return;
        uint8_t buf[14];
        readBytes(0x68, 0x3B, 14, buf);
        sysData.accel[0] = (buf[0] << 8) | buf[1];
        sysData.accel[1] = (buf[2] << 8) | buf[3];
        sysData.accel[2] = (buf[4] << 8) | buf[5];
    }
}

// ==========================================
// 4. CLOUD SYNC & FREERTOS TASK (CORE 0)
// ==========================================
namespace CloudSync {
    TaskHandle_t uploadTaskHandle = NULL;
    
    // Thread-safe data buffer for the upload task
    float avgHr = 0, avgSpO2 = 0;
    double lat = 0, lng = 0; float speed = 0;
    int16_t ax = 0, ay = 0, az = 0;

    void init() {
        Serial.print("[NET] Connecting to WiFi: ");
        Serial.println(Config::WIFI_SSID);
        WiFi.begin(Config::WIFI_SSID, Config::WIFI_PASS);
        
        while (WiFi.status() != WL_CONNECTED) {
            delay(500);
            Serial.print(".");
        }
        Serial.println("\n[NET] WiFi Connected! IP: " + WiFi.localIP().toString());
    }

    // THIS FUNCTION RUNS ENTIRELY ON CORE 0
    void uploadTask(void *pvParameters) {
        for(;;) {
            // Task sleeps until loop() triggers it every 10 seconds
            ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
            
            if (WiFi.status() == WL_CONNECTED) {
                // Construct JSON
                StaticJsonDocument<512> doc; 
                doc["card_id"]   = Config::DEVICE_ID;
                doc["heartrate"] = avgHr;
                doc["spo2"]      = avgSpO2;
                doc["timestamp"] = millis();
                
                // Extra telemetry data!
                doc["lat"]       = lat;
                doc["lng"]       = lng;
                doc["speed"]     = speed;
                doc["ax"]        = ax;
                doc["ay"]        = ay;
                doc["az"]        = az;

                String jsonBuffer;
                serializeJson(doc, jsonBuffer);
                
                HTTPClient http;
                http.begin(Config::SERVER_URL);
                http.addHeader("Content-Type", "application/json");
                
                Serial.print("[NET] Uploading... ");
                int httpResponseCode = http.POST(jsonBuffer);
                
                if (httpResponseCode > 0) {
                    Serial.printf("Success (HTTP %d)\n", httpResponseCode);
                    Serial.println(jsonBuffer);
                } else {
                    Serial.printf("FAILED (%s)\n", http.errorToString(httpResponseCode).c_str());
                }
                http.end();
            } else {
                Serial.println("[NET] WiFi Disconnected. Skipping upload.");
            }
        }
    }
}

// ==========================================
// 5. SYSTEM SETUP
// ==========================================
void setup() {
    Serial.begin(115200);
    
    // Connect to WiFi
    CloudSync::init();
    
    // Init Dual I2C Buses at 400kHz
    Wire.begin(Config::PIN_MAX_SDA, Config::PIN_MAX_SCL); Wire.setClock(400000); 
    Wire1.begin(Config::PIN_MPU_SDA, Config::PIN_MPU_SCL); Wire1.setClock(400000); 
    
    gpsSerial.begin(Config::GPS_BAUD, SERIAL_8N1, Config::PIN_GPS_RX, Config::PIN_GPS_TX);

    Serial.println("\n[SYS] Booting YatriTech Firmware v2.1...");

    sysData.imuOnline = IMU::init();
    sysData.biometricsOnline = pox.begin();
    if (sysData.biometricsOnline) {
        pox.setIRLedCurrent(MAX30100_LED_CURR_27_1MA); 
        pox.setOnBeatDetectedCallback(onPulseDetected);
    }

    // CRITICAL: Launch the HTTP task on Core 0
    xTaskCreatePinnedToCore(
        CloudSync::uploadTask,   // Function to implement the task
        "UploadTask",            // Name of the task
        8192,                    // Stack size in words
        NULL,                    // Task input parameter
        1,                       // Priority of the task
        &CloudSync::uploadTaskHandle, // Task handle
        0                        // Pin task to core 0
    );

    Serial.println("[SYS] RTOS Dual-Core Scheduler started.\n");
}

// ==========================================
// 6. MAIN SENSOR LOOP (CORE 1)
// ==========================================
// ==========================================
// 6. MAIN SENSOR LOOP (CORE 1)
// ==========================================
void loop() {
    static unsigned long lastImuTime = 0;
    static unsigned long lastDisplayTime = 0;
    unsigned long currentMillis = millis();

    // 1. ALWAYS UPDATE BIOMETRICS
    if (sysData.biometricsOnline) pox.update(); 
    
    // 2. CHECK GPS
    while (gpsSerial.available() > 0) {
        gpsParser.encode(gpsSerial.read());
        if (sysData.biometricsOnline) pox.update(); 
    }
    
    // 3. READ IMU (50 Hz)
    if (currentMillis - lastImuTime >= 20) {
        lastImuTime = currentMillis;
        IMU::update();
    }

    // 4. DISPLAY & AVERAGING TASK (1 Hz)
    if (currentMillis - lastDisplayTime >= 1000) {
        lastDisplayTime = currentMillis;

        // Fetch Data
        if (sysData.biometricsOnline) {
            sysData.heartRate = pox.getHeartRate();
            sysData.spO2 = pox.getSpO2();
        }
        if (gpsParser.location.isValid()) {
            sysData.lat = gpsParser.location.lat();
            sysData.lng = gpsParser.location.lng();
            sysData.speedKmph = gpsParser.speed.kmph();
        }

        // Print to Monitor
        Serial.printf("[SENSORS] HR: %.1f | SpO2: %d%% | Speed: %.1f km/h\n", 
                      sysData.heartRate, sysData.spO2, sysData.speedKmph);

        // --- THE 10-SECOND BATCH LOGIC ---
        // Add static sum variables for ALL sensors
        static float hrSum = 0, spo2Sum = 0, speedSum = 0;
        static double latSum = 0, lngSum = 0;
        static long axSum = 0, aySum = 0, azSum = 0; 
        static int sampleIndex = 0;

        // Accumulate values every second
        hrSum += sysData.heartRate;
        spo2Sum += sysData.spO2;
        latSum += sysData.lat;
        lngSum += sysData.lng;
        speedSum += sysData.speedKmph;
        axSum += sysData.accel[0];
        aySum += sysData.accel[1];
        azSum += sysData.accel[2];
        
        sampleIndex++;

        // Once 10 seconds pass, calculate averages and trigger upload!
        if (sampleIndex >= 10) {
            // Safely copy averaged data to the CloudSync namespace variables
            CloudSync::avgHr = hrSum / 10.0;
            CloudSync::avgSpO2 = spo2Sum / 10.0;
            CloudSync::lat = latSum / 10.0;
            CloudSync::lng = lngSum / 10.0;
            CloudSync::speed = speedSum / 10.0;
            
            // Integer division for raw accelerometer data
            CloudSync::ax = axSum / 10;
            CloudSync::ay = aySum / 10;
            CloudSync::az = azSum / 10;

            // WAKE UP CORE 0 TO DO THE UPLOAD
            xTaskNotifyGive(CloudSync::uploadTaskHandle);

            // Reset all averages and the index counter for the next batch
            hrSum = 0;
            spo2Sum = 0;
            latSum = 0;
            lngSum = 0;
            speedSum = 0;
            axSum = 0;
            aySum = 0;
            azSum = 0;
            sampleIndex = 0;
        }
    }
}