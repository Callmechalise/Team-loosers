#include <Wire.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "MAX30100_PulseOximeter.h"

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

struct SystemData {
    float heartRate = 0.0;
    uint8_t spO2 = 0;
    bool biometricsOnline = false;
    int16_t accel[3] = {0, 0, 0};
    int16_t gyro[3]  = {0, 0, 0};
    int16_t mag[3]   = {0, 0, 0};
    bool imuOnline = false;
    double lat = 0.0, lng = 0.0;
    float speedKmph = 0.0;
    uint8_t satellites = 0;
    bool gpsLocked = false;
} sysData;

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
            ledcWrite(Config::PIN_BUZZER, 64);
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

namespace IMU {
    void writeByte(uint8_t addr, uint8_t reg, uint8_t data) {
        Wire1.beginTransmission(addr);
        Wire1.write(reg);
        Wire1.write(data);
        Wire1.endTransmission();
    }

    void readBytes(uint8_t addr, uint8_t reg, uint8_t count, uint8_t* dest) {
        memset(dest, 0, count); 
        Wire1.beginTransmission(addr);
        Wire1.write(reg);
        if (Wire1.endTransmission(false) != 0) return;
        Wire1.requestFrom((int)addr, (int)count);
        for (int i = 0; i < count && Wire1.available(); i++) {
            dest[i] = Wire1.read();
        }
    }

    bool init() {
        Wire1.beginTransmission(Config::MPU9250_ADDR);
        if (Wire1.endTransmission() != 0) return false;
        writeByte(Config::MPU9250_ADDR, 0x6B, 0x00);
        delay(10);
        writeByte(Config::MPU9250_ADDR, 0x37, 0x02);
        delay(10);
        writeByte(Config::AK8963_ADDR, 0x0A, 0x00);
        delay(10);
        writeByte(Config::AK8963_ADDR, 0x0A, 0x16);
        return true;
    }

    void update() {
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

TinyGPSPlus gpsParser;
HardwareSerial gpsSerial(1);
PulseOximeter pox;

void onPulseDetected() {
    HMI::beep(1000, 50);
}

void setup() {
    Serial.begin(115200);
    HMI::init();
    
    Wire.begin(Config::PIN_MAX_SDA, Config::PIN_MAX_SCL);  
    Wire.setClock(400000); 
    Wire.setTimeOut(20);

    Wire1.begin(Config::PIN_MPU_SDA, Config::PIN_MPU_SCL); 
    Wire1.setClock(400000); 
    Wire1.setTimeOut(20);
    
    gpsSerial.begin(Config::GPS_BAUD, SERIAL_8N1, Config::PIN_GPS_RX, Config::PIN_GPS_TX);

    sysData.imuOnline = IMU::init();

    sysData.biometricsOnline = pox.begin();
    if (sysData.biometricsOnline) {
        pox.setIRLedCurrent(MAX30100_LED_CURR_27_1MA); 
        pox.setOnBeatDetectedCallback(onPulseDetected);
    }

    HMI::beep(2000, 150); delay(200); HMI::beep(2500, 150);
}

void loop() {
    static unsigned long lastImuTime = 0;
    static unsigned long lastDisplayTime = 0;
    unsigned long currentMillis = millis();

    if (sysData.biometricsOnline) {
        pox.update(); 
    }
    
    while (gpsSerial.available() > 0) {
        gpsParser.encode(gpsSerial.read());
        if (sysData.biometricsOnline) {
            pox.update(); 
        }
    }
    
    HMI::update(); 

    if (currentMillis - lastImuTime >= 20) {
        lastImuTime = currentMillis;
        IMU::update();
    }

    if (currentMillis - lastDisplayTime >= 1000) {
        lastDisplayTime = currentMillis;

        if (sysData.biometricsOnline) {
            sysData.heartRate = pox.getHeartRate();
            sysData.spO2 = pox.getSpO2();
        } else {
            sysData.heartRate = 0.0;
            sysData.spO2 = 0;
        }

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
        
        if (!sysData.imuOnline) {
            for (int i = 0; i < 3; i++) {
                sysData.accel[i] = 0;
                sysData.gyro[i]  = 0;
                sysData.mag[i]   = 0;
            }
        }

        Serial.printf("%.1f,%d,%d,%d,%d,%.6f,%.6f,%.1f,%d\n", 
                      sysData.heartRate, sysData.spO2,
                      sysData.accel[0], sysData.accel[1], sysData.accel[2],
                      sysData.lat, sysData.lng, sysData.speedKmph,
                      sysData.satellites);
    }
}