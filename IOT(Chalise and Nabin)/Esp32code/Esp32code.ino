#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

//spo2 ko lagi variable
#define debug Serial
MAX30105 particleSensor;
long redValue = 0;
long irValue = 0;
float spo2Value = 0.0;
bool fingerDetected = false;

// Heart rate calculation ko lagi variables
const uint8_t RATE_SIZE = 4;  // Increase this for more averaging
uint8_t rates[RATE_SIZE];
uint8_t rateSpot = 0;
long lastBeat = 0; // Time at which the last beat occurred
float heartRate = 0.0;



int sda = 20;
int scl = 21;
int interrupt = 5;

const char* ssid = "Galaxy F22";
const char* password = "11111111";

const char* serverURL = "http://192.168.63.12:8000/data";


// ============ SETUP FUNCTION ============
void setup_sensor()
{
  debug.begin(115200);
  debug.println("Initializing MAX30102...");

  if (particleSensor.begin() == false)
  {
    debug.println("MAX30102 not found. Check wiring!");
    while (1);
  }

  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);
  for (uint8_t i = 0; i < RATE_SIZE; i++)
  {
    rates[i] = 0;
  }
  
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



  if(WiFi.status() == WL_CONNECTED)
  {

    HTTPClient http;


    http.begin(serverURL);

    http.addHeader(
      "Content-Type",
      "application/json"
    );


    int httpResponseCode = http.POST(jsonBuffer);



    if(httpResponseCode > 0)
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

float get_spo2_data()
{
  redValue = particleSensor.getRed();
  irValue = particleSensor.getIR();
  
  // Check finger presence
  if (irValue < 50000)
  {
    fingerDetected = false;
    return -1.0; // No finger
  }
  
  fingerDetected = true;
  
  // Calculate SpO2
  float R = (float)redValue / (float)irValue;
  spo2Value = 104.0 - 17.0 * R;
  
  // Clamp values to realistic range (70-100%)
  if (spo2Value > 100.0) spo2Value = 100.0;
  if (spo2Value < 70.0) spo2Value = 70.0;
  
  return spo2Value;
}


// ============ PULSE RATE FUNCTION ============
float get_pulserate_data()
{
  irValue = particleSensor.getIR();
  
  // Check finger presence
  if (irValue < 50000)
  {
    fingerDetected = false;
    return -1.0; // No finger
  }
  
  fingerDetected = true;
  
  // Detect a beat
  if (checkForBeat(irValue) == true)
  {
    // We sensed a beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();
    
    // Calculate beats per minute (BPM)
    int bpm = 60 / (delta / 1000.0);
    
    // Add to the rate array for averaging
    rates[rateSpot++] = (uint8_t)bpm;
    rateSpot %= RATE_SIZE;
    
    // Calculate average heart rate
    uint8_t sum = 0;
    for (uint8_t i = 0; i < RATE_SIZE; i++)
    {
      sum += rates[i];
    }
    heartRate = sum / RATE_SIZE;
  }
  
  return heartRate;
}



/*bool is_finger_present()
{
  return fingerDetected;
}*/

void setup() {

  Serial.begin(115200);

  setup_sensor();
  setup_wifi();

}



void loop() {

  float spo2 = get_spo2_data();
  float heart_rate=get_pulserate_data();
  sendJSON("Div001",heart_rate,spo2);


  delay(5000);

}