#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

//pinout
int sda = 21;
int scl = 22;
int interrupt = 5;

//spo2 ko lagi variable
#define debug Serial
PulseOximeter pox;

float spo2Value = 0.0;
float heartRate = 0.0;
bool fingerDetected = false;

const char* ssid = "Galaxy F22";
const char* password = "11111111";
const char* serverURL = "http://192.168.63.12:8000/data";

// timing for sampling (replaces blocking delay(1000) x10 loop)
uint32_t lastSampleTime = 0;
const uint32_t SAMPLE_INTERVAL_MS = 1000;
const int SAMPLE_COUNT = 10;

int sampleIndex = 0;
float spo2Sum = 0;
float hrSum = 0;

void onBeatDetected()
{
  fingerDetected = true;
  Serial.println("Beat!");
}

void setup_sensor()
{
  Wire.begin(sda, scl);

  debug.println("Initializing MAX30100...");

  if (!pox.begin())
  {
    debug.println("MAX30100 not found. Check wiring!");
    while (1);
  }

  pox.setIRLedCurrent(MAX30100_LED_CURR_50MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);

  debug.println("Sensor ready!");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void sendJSON(String cardID, float heartrate, float spo2)
{
  StaticJsonDocument<256> doc;
  doc["card_id"] = cardID;
  doc["heartrate"] = heartrate;
  doc["spo2"] = spo2;
  doc["timestamp"] = millis();

  String jsonBuffer;
  serializeJson(doc, jsonBuffer);

  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonBuffer);

    if (httpResponseCode > 0)
    {
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      Serial.println("JSON Sent:");
      Serial.println(jsonBuffer);
    }
    else
    {
      Serial.print("HTTP Error: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
  else
  {
    Serial.println("WiFi Disconnected");
  }
}

void setup() {
  Serial.begin(115200);
  setup_sensor();
  setup_wifi();
}

void loop()
{
  // This MUST run every loop iteration, unthrottled, for the algorithm to work
  pox.update();

  // Take one "sample" every SAMPLE_INTERVAL_MS, without blocking pox.update()
  if (millis() - lastSampleTime > SAMPLE_INTERVAL_MS)
  {
    lastSampleTime = millis();

    float spo2 = pox.getSpO2();
    float heart_rate = pox.getHeartRate();

    if (spo2 <= 0) spo2 = 0;
    if (heart_rate <= 0) heart_rate = 0;

    Serial.print("SpO2: ");
    Serial.print(spo2);
    Serial.print("%  Pulse: ");
    Serial.print(heart_rate);
    Serial.println(" BPM");

    spo2Sum += spo2;
    hrSum += heart_rate;
    sampleIndex++;

    if (sampleIndex >= SAMPLE_COUNT)
    {
      float avgspo2 = spo2Sum / SAMPLE_COUNT;
      float avgheart_rate = hrSum / SAMPLE_COUNT;

      Serial.println("---- Average ----");
      Serial.print("SpO2: ");
      Serial.println(avgspo2);
      Serial.print("Heart Rate: ");
      Serial.println(avgheart_rate);

      sendJSON("Div001", avgheart_rate, avgspo2);

      // reset for next batch
      sampleIndex = 0;
      spo2Sum = 0;
      hrSum = 0;
    }
  }
}