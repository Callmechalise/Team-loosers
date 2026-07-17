#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Galaxy F22";
const char* password = "11111111";

// FastAPI server URL
const char* serverURL = "http://192.168.63.47:8000/api/data";

void setup() {
  Serial.begin(115200);

  // Connect WiFi
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.print("ESP IP: ");
  Serial.println(WiFi.localIP());
}


void loop() {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");


    // Create JSON object
   // Create JSON object
StaticJsonDocument<512> jsonDoc;

// Required fields
jsonDoc["card_id"] = "ESP_001";

jsonDoc["heartrate"] = 75;
jsonDoc["spo2"] = 98;

jsonDoc["timestamp"] = 1234567890;


// Optional fields
jsonDoc["fallDetected"] = false;
jsonDoc["btn_alert"] = false;

jsonDoc["lat"] = 0;
jsonDoc["long"] = 0;

jsonDoc["accx"] = 0;
jsonDoc["accy"] = 0;
jsonDoc["accz"] = 0;


// Convert JSON to String
String jsonString;

serializeJson(jsonDoc, jsonString);

    Serial.println("Sending JSON:");
    Serial.println(jsonString);


    // HTTP POST request
    int httpResponseCode = http.POST(jsonString);


    if (httpResponseCode > 0) {

      Serial.print("Server Response Code: ");
      Serial.println(httpResponseCode);

      String response = http.getString();
      Serial.println("Response:");
      Serial.println(response);

    } 
    else {

      Serial.print("HTTP Error: ");
      Serial.println(httpResponseCode);

    }


    http.end();

  }
  else {
    Serial.println("WiFi disconnected");
  }


  delay(5000); // send every 5 seconds
}