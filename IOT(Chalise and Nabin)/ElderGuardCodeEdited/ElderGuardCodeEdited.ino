/**
 * @file      ElderGuardCodeEdited.ino
 * @brief     Master telemetry node for biometrics, IMU, GPS, and backend upload.
 * @author    Nabin Basnet / YatriTech
 * @architecture 
 *            - I2C0 (6,7)   -> MAX30100 (Biometrics)
 *            - I2C1 (8,9)   -> MPU9250 (IMU)
 *            - UART1 (16,17)-> NEO-6M (GPS)
 *            - GPIO 4       -> PWM Buzzer
 *            - WiFi         -> HTTP POST to FastAPI backend
 */

#include <Wire.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "MAX30100_PulseOximeter.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==========================================
// 1. HARDWARE CONFIGURATION (Type-Safe)
// ==========================================
namespace Config {
    constexpr uint8_t PIN_MAX_SDA = 6;
    constexpr uint8_t PIN_MAX_SCL = 7;
    
    constexpr uint8_t PIN_MPU_SDA = 8;
    constexpr uint8_t PIN_MPU_SCL = 9;
    constexpr uint8_t MPU9250_ADDR = 0x68;
    constexpr uint8_t AK8963_ADDR  = 0x0C;
    
    constexpr uint8_t PIN_GPS_RX = 16;
    constexpr uint8_t PIN_GPS_TX = 17;
    constexpr uint32_t GPS_BAUD  = 9600;
    
    constexpr uint8_t PIN_BUZZER = 4;
}

// ==========================================
// 1b. NETWORK CONFIGURATION
// ==========================================
namespace NetConfig {
    constexpr char SSID[]     = "Galaxy F22";
    constexpr char PASSWORD[] = "11111111";
    constexpr char SERVER_URL[] = "http://192.168.63.47:8000/api/data";
    constexpr char CARD_ID[]    = "ESP_001"; // Unique ID for this device/wearer

    constexpr unsigned long SEND_INTERVAL_MS = 5000; // Upload cadence
    constexpr unsigned long WIFI_RETRY_INTERVAL_MS = 10000; // Reconnect backoff
}

// ==========================================
// 2. GLOBAL SYSTEM STATE (Data Container)
// ==========================================
struct SystemData {
    // Biometrics
    float heartRate = 0.0;
    uint8_t spO2 = 0;
    bool biometricsOnline = false;

    // Telemetry
    int16_t accel[3] = {0, 0, 0};
    int16_t gyro[3]  = {0, 0, 0};
    int16_t mag[3]   = {0, 0, 0};
    bool imuOnline = false;

    // Location
    double lat = 0.0, lng = 0.0;
    float speedKmph = 0.0;
    uint8_t satellites = 0;
    bool gpsLocked = false;

    // Safety flags (placeholders until real logic is added)
    bool fallDetected = false;
    bool btnAlert = false;
} sysData;

// ==========================================
// 3. HARDWARE ABSTRACTION LAYERS (HAL)
// ==========================================

// --- BUZZER MODULE ---
namespace HMI {
    unsigned long beepEndTime = 0;
    bool isBeeping = false;

    void init() {
        #if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
            ledcAttach(Config::PIN_BUZZER, 2000, 8);
            ledcWrite(Config::PIN_BUZZER, 0);
        #else
            ledcSetup(0, 2000, 8);
            ledcAttachPin(Config::PIN_BUZZER, 0);
            ledcWrite(0, 0);
        #endif
    }

    void beep(int freq, int durationMs) {
        #if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
            ledcAttach(Config::PIN_BUZZER, freq, 8);
            ledcWrite(Config::PIN_BUZZER, 64); // 25% duty cycle (volume)
        #else
            ledcSetup(0, freq, 8);
            ledcWrite(0, 64);
        #endif
        beepEndTime = millis() + durationMs;
        isBeeping = true;
    }

    void update() {
        if (isBeeping && millis() > beepEndTime) {
            #if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
                ledcWrite(Config::PIN_BUZZER, 0);
            #else
                ledcWrite(0, 0);
            #endif
            isBeeping = false;
        }
    }
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
        // Pre-fill buffer with 0s. If I2C disconnects, we automatically return 0s.
        memset(dest, 0, count); 
        
        Wire1.beginTransmission(addr);
        Wire1.write(reg);
        if (Wire1.endTransmission(false) != 0) return; // Do not wait if bus fails
        
        Wire1.requestFrom((int)addr, (int)count);
        for (int i = 0; i < count && Wire1.available(); i++) {
            dest[i] = Wire1.read();
        }
    }

    bool init() {
        Wire1.beginTransmission(Config::MPU9250_ADDR);
        if (Wire1.endTransmission() != 0) return false;

        writeByte(Config::MPU9250_ADDR, 0x6B, 0x00); // Wake up
        delay(10);
        writeByte(Config::MPU9250_ADDR, 0x37, 0x02); // I2C Bypass
        delay(10);
        writeByte(Config::AK8963_ADDR, 0x0A, 0x00);  // Mag Power down
        delay(10);
        writeByte(Config::AK8963_ADDR, 0x0A, 0x16);  // Mag Cont. Mode 2
        return true;
    }

    void update() {
        // Even if marked offline initially, we attempt to read 0s 
        // to keep variables clean if something fails dynamically.
        uint8_t buf[14];
        readBytes(Config::MPU9250_ADDR, 0x3B, 14, buf);
        sysData.accel[0] = (buf[0] << 8) | buf[1];
        sysData.accel[1] = (buf[2] << 8) | buf[3];
        sysData.accel[2] = (buf[4] << 8) | buf[5];
        sysData.gyro[0]  = (buf[8] << 8) | buf[9];
        sysData.gyro[1]  = (buf[10] << 8) | buf[11];
        sysData.gyro[2]  = (buf[12] << 8) | buf[13];

        uint8_t magBuf[7];
        readBytes(Config::AK8963_ADDR, 0x03, 7, magBuf);
        sysData.mag[0] = (magBuf[1] << 8) | magBuf[0];
        sysData.mag[1] = (magBuf[3] << 8) | magBuf[2];
        sysData.mag[2] = (magBuf[5] << 8) | magBuf[4];
    }
}

// --- NETWORK MODULE (WiFi + HTTP POST to FastAPI backend) ---
namespace Backend {
    unsigned long lastWifiAttempt = 0;

    void connect() {
        Serial.print("[NET] Connecting to WiFi");
        WiFi.begin(NetConfig::SSID, NetConfig::PASSWORD);

        // Blocking wait is fine here: this only runs once, in setup().
        unsigned long start = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
            delay(500);
            Serial.print(".");
        }

        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\n[NET] WiFi Connected");
            Serial.print("[NET] ESP IP: ");
            Serial.println(WiFi.localIP());
        } else {
            Serial.println("\n[NET] WiFi connect timed out, will retry in background");
        }
    }

    // Non-blocking reconnect attempt, called periodically from loop()
    void maintain() {
        if (WiFi.status() != WL_CONNECTED) {
            unsigned long now = millis();
            if (now - lastWifiAttempt >= NetConfig::WIFI_RETRY_INTERVAL_MS) {
                lastWifiAttempt = now;
                Serial.println("[NET] WiFi disconnected, retrying...");
                WiFi.disconnect();
                WiFi.begin(NetConfig::SSID, NetConfig::PASSWORD);
            }
        }
    }

    void sendTelemetry() {
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("[NET] Skipped send: WiFi disconnected");
            return;
        }

        HTTPClient http;
        http.begin(NetConfig::SERVER_URL);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<512> jsonDoc;

        // Required fields
        jsonDoc["card_id"] = NetConfig::CARD_ID;
        jsonDoc["heartrate"] = sysData.heartRate;
        jsonDoc["spo2"] = sysData.spO2;

        // NOTE: no RTC/NTP sync on this board yet, so this is milliseconds
        // since boot, not a real Unix epoch timestamp. Sync via NTP if the
        // backend needs true wall-clock time.
        jsonDoc["timestamp"] = millis();

        // Optional / safety fields (placeholders until fall-detection
        // logic and a physical alert button are added)
        jsonDoc["fallDetected"] = sysData.fallDetected;
        jsonDoc["btn_alert"] = sysData.btnAlert;

        // Location: 0 when GPS has no valid lock (matches SystemData's
        // existing "store 0 if invalid" convention)
        jsonDoc["lat"] = sysData.lat;
        jsonDoc["long"] = sysData.lng;

        // Raw accelerometer counts from the MPU9250
        jsonDoc["accx"] = sysData.accel[0];
        jsonDoc["accy"] = sysData.accel[1];
        jsonDoc["accz"] = sysData.accel[2];

        String jsonString;
        serializeJson(jsonDoc, jsonString);

        Serial.println("[NET] Sending JSON:");
        Serial.println(jsonString);

        int httpResponseCode = http.POST(jsonString);

        if (httpResponseCode > 0) {
            Serial.print("[NET] Server Response Code: ");
            Serial.println(httpResponseCode);
            Serial.println("[NET] Response: " + http.getString());
        } else {
            Serial.print("[NET] HTTP Error: ");
            Serial.println(httpResponseCode);
        }

        http.end();
    }
}

// ==========================================
// 4. INSTANCES & CALLBACKS
// ==========================================
TinyGPSPlus gpsParser;
HardwareSerial gpsSerial(1);
PulseOximeter pox;

void onPulseDetected() {
    HMI::beep(1000, 50); // Short medical beep on every heartbeat
}

// ==========================================
// 5. SYSTEM INITIALIZATION
// ==========================================
void setup() {
    Serial.begin(115200);
    HMI::init();
    
    // Init Buses and set I2C speed to 400kHz (Fast Mode) to prevent blocking
    Wire.begin(Config::PIN_MAX_SDA, Config::PIN_MAX_SCL);  
    Wire.setClock(400000); 
    Wire.setTimeOut(20); // Prevent infinite hanging if sensor disconnects

    Wire1.begin(Config::PIN_MPU_SDA, Config::PIN_MPU_SCL); 
    Wire1.setClock(400000); 
    Wire1.setTimeOut(20); // Prevent infinite hanging if sensor disconnects
    
    gpsSerial.begin(Config::GPS_BAUD, SERIAL_8N1, Config::PIN_GPS_RX, Config::PIN_GPS_TX);

    Serial.println("\n[SYS] Booting YatriTech Firmware v1.2...");

    // Init IMU 
    sysData.imuOnline = IMU::init();
    Serial.print("[SYS] IMU (MPU9250): "); 
    Serial.println(sysData.imuOnline ? "OK" : "FAIL");

    // Init Biometrics
    sysData.biometricsOnline = pox.begin();
    if (sysData.biometricsOnline) {
        // High LED current to read through the skin reliably
        pox.setIRLedCurrent(MAX30100_LED_CURR_27_1MA); 
        pox.setOnBeatDetectedCallback(onPulseDetected);
        Serial.println("[SYS] Oximeter (MAX30100): OK");
    } else {
        Serial.println("[SYS] Oximeter (MAX30100): FAIL (Check I2C0 wires!)");
    }

    // Connect to WiFi and prepare backend link
    Backend::connect();

    // Success boot chime
    HMI::beep(2000, 150); delay(200); HMI::beep(2500, 150); 
    Serial.println("[SYS] Kernel scheduler started.\n");
}

// ==========================================
// 6. MAIN SCHEDULER
// ==========================================
void loop() {
    static unsigned long lastImuTime = 0;
    static unsigned long lastDisplayTime = 0;
    static unsigned long lastSendTime = 0;
    unsigned long currentMillis = millis();

    // 1. HIGHEST PRIORITY: Check Biometrics constantly
    if (sysData.biometricsOnline) {
        pox.update(); 
    }
    
    // 2. CRITICAL FIX: Weave pox.update() INSIDE the GPS loop to prevent timing starvation
    while (gpsSerial.available() > 0) {
        gpsParser.encode(gpsSerial.read());
        if (sysData.biometricsOnline) {
            pox.update(); 
        }
    }
    
    // 3. Process buzzer timeouts
    HMI::update(); 

    // 4. IMU TASKS (Run exactly every 20ms / 50Hz)
    if (currentMillis - lastImuTime >= 20) {
        lastImuTime = currentMillis;
        IMU::update();
    }

    // 5. DISPLAY TASKS (Run exactly every 1000ms / 1Hz)
    if (currentMillis - lastDisplayTime >= 1000) {
        lastDisplayTime = currentMillis;

        // --- FILTER & STORE ZEROES ---
        // Biometrics: Store 0 if offline
        if (sysData.biometricsOnline) {
            sysData.heartRate = pox.getHeartRate();
            sysData.spO2 = pox.getSpO2();
        } else {
            sysData.heartRate = 0.0;
            sysData.spO2 = 0;
        }

        // GPS: Store 0 if no valid lock
        sysData.satellites = gpsParser.satellites.isValid() ? gpsParser.satellites.value() : 0;
        if (gpsParser.location.isValid()) {
            sysData.gpsLocked = true;
            sysData.lat = gpsParser.location.lat();
            sysData.lng = gpsParser.location.lng();
            sysData.speedKmph = gpsParser.speed.isValid() ? gpsParser.speed.kmph() : 0.0;
        } else {
            sysData.gpsLocked = false;
            sysData.lat = 0.0;
            sysData.lng = 0.0;
            sysData.speedKmph = 0.0;
        }
        
        // IMU: Ensure variables are wiped to 0 if I2C dropped completely
        if (!sysData.imuOnline) {
            for (int i = 0; i < 3; i++) {
                sysData.accel[i] = 0;
                sysData.gyro[i]  = 0;
                sysData.mag[i]   = 0;
            }
        }

        // --- LOCAL DEBUG PRINT LAYER ---
        // Unconditionally print the variables (will output 0s if invalid/disconnected)
        Serial.println("=========================================");
        Serial.printf("[ BIOMETRICS ] HR: %.1f bpm | SpO2: %d %%\n", sysData.heartRate, sysData.spO2);
        Serial.printf("[ TELEMETRY  ] AX: %d | AY: %d | AZ: %d\n", sysData.accel[0], sysData.accel[1], sysData.accel[2]);
        Serial.printf("[ LOCATION   ] SATS: %d | LAT: %.6f | LNG: %.6f | SPD: %.1f km/h\n", 
                      sysData.satellites, sysData.lat, sysData.lng, sysData.speedKmph);
        Serial.println("=========================================\n");
    }

    // 6. NETWORK TASKS: keep WiFi alive, then upload every SEND_INTERVAL_MS
    Backend::maintain();
    if (currentMillis - lastSendTime >= NetConfig::SEND_INTERVAL_MS) {
        lastSendTime = currentMillis;
        Backend::sendTelemetry();
    }
}
