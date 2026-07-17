#include <WiFi.h>

const char* ssid = "Galaxy F22";
const char* password = "11111111";


void setup()
{
  Serial.begin(115200);

  WiFi.begin(ssid,password);

  Serial.print("Connecting");

  while(WiFi.status()!=WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected!");

  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}


void loop()
{

}