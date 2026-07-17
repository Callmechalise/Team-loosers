#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

//pinout
int sda = 21;
int scl = 22; 
int interrupt = 5;
int alertbtn = 4;  // CHANGED: Use GPIO 4 instead of 2 (avoid conflict with built-in LED)

//spo2 ko lagi variable
#define debug Serial
PulseOximeter pox;

float spo2Value = 0.0;
float heartRate = 0.0;
bool fingerDetected = false;

const char* ssid = "Galaxy F22";
const char* password = "11111111";
const char* serverURL = "http://192.168.63.12:8000/data";

// Non-blocking timing variables
unsigned long lastUpdateTime = 0;
unsigned long lastSendTime = 0;
const unsigned long UPDATE_INTERVAL = 20;    // Update sensor every 20ms
const unsigned long SEND_INTERVAL = 10000;   // Send data every 10 seconds

// Data averaging variables
float spo2Sum = 0;
float hrSum = 0;
int sampleCount = 0;
const int SAMPLES_PER_SEND = 500;  // 500 samples * 20ms = 10 seconds

// Button debouncing variables
bool lastButtonState = HIGH;
bool buttonPressed = false;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

// Track if alert was already sent
bool alertSent = false;

void onBeatDetected()
{
  fingerDetected = true;
}

void setup_sensor()
{
  debug.begin(115200);
  debug.println("Initializing MAX30100...");

  Wire.begin(sda, scl);
  
  // Try multiple times to initialize
  bool initialized = false;
  for(int attempt = 0; attempt < 3; attempt++) {
    if (pox.begin()) {
      initialized = true;
      break;
    }
    debug.println("Retry initialization...");
    delay(1000);
  }
  
  if (!initialized) {
    debug.println("MAX30100 not found. Check wiring!");
    while(1);
  }
  
  pox.setIRLedCurrent(MAX30100_LED_CURR_50MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);
  
  debug.println("Sensor ready!");
}

void setup_wifi() {
  Serial.println();
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if(WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi Connection Failed!");
  }
}

void sendStatusWithMessage(String cardID, bool status, String message, float heartrate = 0, float spo2 = 0)
{
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected - Cannot send data");
    return;
  }
  
  // Increase JSON size to accommodate additional fields
  StaticJsonDocument<512> doc;
  doc["card_id"] = cardID;
  doc["status"] = status;           // Boolean value
  doc["message"] = message;         // String message
  doc["heartrate"] = heartrate;     // Optional: include heartrate if provided
  doc["spo2"] = spo2;              // Optional: include spo2 if provided
  doc["timestamp"] = millis();

  String jsonBuffer;
  serializeJson(doc, jsonBuffer);

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonBuffer);

  if(httpResponseCode > 0) {
    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);
    Serial.println("JSON Sent:");
    Serial.println(jsonBuffer);
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

float get_spo2_data()
{
  spo2Value = pox.getSpO2();
  if(spo2Value <= 0 || spo2Value > 100)
    return 0;
  return spo2Value;
}

float get_pulserate_data()
{
  heartRate = pox.getHeartRate();
  if(heartRate <= 0 || heartRate > 250)
    return 0;
  return heartRate;
}

void setup() {
  // Setup button with internal pull-up
  pinMode(alertbtn, INPUT_PULLUP);
  
  Serial.begin(115200);
  delay(1000);  // Give serial time to initialize
  
  setup_sensor();
  setup_wifi();
  
  // Initialize timing variables
  lastUpdateTime = millis();
  lastSendTime = millis();
  spo2Sum = 0;
  hrSum = 0;
  sampleCount = 0;
  
  Serial.println("System Ready! Place finger on sensor...");
  Serial.println("Press button to send alert...");
}

void loop()
{
  unsigned long currentMillis = millis();
  
  // ===== BUTTON HANDLING WITH DEBOUNCING =====
  int reading = digitalRead(alertbtn);
  
  // Check if button state changed
  if (reading != lastButtonState) {
    lastDebounceTime = currentMillis;
  }
  
  // Wait for debounce time to pass
  if ((currentMillis - lastDebounceTime) > DEBOUNCE_DELAY) {
    // Button state is stable
    if (reading != buttonPressed) {
      buttonPressed = reading;
      
      // Only trigger on button press (LOW because of pull-up)
      if (buttonPressed == LOW) {
        Serial.println("⚠️ ALERT BUTTON PRESSED! Sending alert...");
        sendStatusWithMessage("Div001", true, "Emergency Alert!", 0, 0);
        alertSent = true;
        
        // Blink built-in LED to show alert was sent
        digitalWrite(2, HIGH);
        delay(200);
        digitalWrite(2, LOW);
      } else {
        // Button released
        if (alertSent) {
          Serial.println("Alert sent successfully");
          alertSent = false;
        }
      }
    }
  }
  
  lastButtonState = reading;
  
  // ===== SENSOR READING =====
  // Update sensor at regular intervals (non-blocking)
  if (currentMillis - lastUpdateTime >= UPDATE_INTERVAL) {
    lastUpdateTime = currentMillis;
    pox.update();
    
    // Read current values
    float spo2 = get_spo2_data();
    float heart_rate = get_pulserate_data();
    
    // Accumulate valid readings
    if (spo2 > 0 && heart_rate > 0) {
      spo2Sum += spo2;
      hrSum += heart_rate;
      sampleCount++;
      
      // Print live data every 50 samples (about 1 second)
      if (sampleCount % 50 == 0) {
        Serial.print("SpO2: ");
        Serial.print(spo2);
        Serial.print("%  Pulse: ");
        Serial.print(heart_rate);
        Serial.println(" BPM");
      }
    } else {
      // Show status if no finger detected
      if (sampleCount > 0 && sampleCount % 100 == 0) {
        Serial.println("Waiting for finger placement...");
      }
    }
  }
  
  // ===== SEND AVERAGED DATA =====
  if (currentMillis - lastSendTime >= SEND_INTERVAL && sampleCount > 0) {
    lastSendTime = currentMillis;
    
    // Calculate averages
    float avgSpO2 = spo2Sum / sampleCount;
    float avgHR = hrSum / sampleCount;
    
    Serial.println("---- Sending Average Data ----");
    Serial.print("SpO2: ");
    Serial.print(avgSpO2);
    Serial.println("%");
    Serial.print("Heart Rate: ");
    Serial.print(avgHR);
    Serial.println(" BPM");
    Serial.print("Samples: ");
    Serial.println(sampleCount);
    
    // Send data to server
    if (avgSpO2 > 0 && avgSpO2 <= 100 && avgHR > 0 && avgHR <= 250) {
      sendStatusWithMessage("Div001", false, "Normal", avgHR, avgSpO2);
    } else {
      Serial.println("Invalid data - not sending");
    }
    
    // Reset accumulators
    spo2Sum = 0;
    hrSum = 0;
    sampleCount = 0;
  }
  
  // Small delay to prevent watchdog timeout
  delay(1);
}