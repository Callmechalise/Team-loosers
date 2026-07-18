// app/demo/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface IoTData {
  _id: string;
  card_id: string;
  heartrate: number;
  spo2: number;
  timestamp: number;
  receivedAt: string;
  lat: number;
  lng: number;
  speed: number;
  ax: number;
  ay: number;
  az: number;
  fallDetected: boolean;
  btn_alert: boolean;
}

// Safe Zone Constants
const SAFE_ZONE_RADIUS = 500; // 500 meters
const HOME_LAT = 27.7172;
const HOME_LNG = 85.3240;

// Component to update map view when location changes
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);
  return null;
}

export default function DemoPage() {
  const [data, setData] = useState<IoTData | null>(null);
  const [history, setHistory] = useState<IoTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOutsideSafeZone, setIsOutsideSafeZone] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(10);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Check if device is outside safe zone
  const checkSafeZone = (lat: number, lng: number) => {
    const distance = calculateDistance(HOME_LAT, HOME_LNG, lat, lng);
    const outside = distance > SAFE_ZONE_RADIUS;
    setIsOutsideSafeZone(outside);
    
    if (outside) {
      setAlertMessage(`⚠️ Device is ${Math.round(distance)}m outside safe zone!`);
    } else {
      setAlertMessage(null);
    }
    
    return { distance, outside };
  };

  // Fetch latest data
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/data/devices/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const devices = await response.json();
      
      // Find data for ESP32_TEST_001 or Chalise-001
      const latestDevice = devices.find(
        (d: IoTData) => d.card_id === 'ESP32_TEST_001' || d.card_id === 'Chalise-001'
      );
      
      if (latestDevice) {
        setData(latestDevice);
        setHistory(prev => [latestDevice, ...prev].slice(0, 50));
        setConnectionStatus('connected');
        setLastUpdate(new Date());
        
        // Check safe zone
        if (latestDevice.lat && latestDevice.lng) {
          checkSafeZone(latestDevice.lat, latestDevice.lng);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setConnectionStatus('disconnected');
      setError('Failed to fetch data. Make sure backend is running.');
      setLoading(false);
    }
  };

  // Start polling
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for fetching data every 10 seconds
    intervalRef.current = setInterval(fetchData, 10000);

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Reset countdown when data updates
  useEffect(() => {
    setCountdown(10);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading IoT data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold">❌ Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">📍 Live IoT Tracking</h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              connectionStatus === 'connected' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Next update in: {countdown}s
            </span>
          </div>
        </div>

        {/* Alert Banner */}
        {alertMessage && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">{alertMessage}</p>
          </div>
        )}

        {isOutsideSafeZone && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded animate-pulse">
            <p className="font-semibold">⚠️ SAFETY ALERT: Device is outside safe zone!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Section - 2/3 width */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="h-[500px] w-full relative">
              {data && data.lat && data.lng ? (
                <MapContainer
                  center={[data.lat, data.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapUpdater position={[data.lat, data.lng]} />
                  
                  {/* Safe Zone Circle */}
                  <Circle
                    center={[HOME_LAT, HOME_LNG]}
                    radius={SAFE_ZONE_RADIUS}
                    pathOptions={{
                      color: isOutsideSafeZone ? 'red' : 'green',
                      fillColor: isOutsideSafeZone ? 'red' : 'green',
                      fillOpacity: 0.1,
                      weight: 2,
                    }}
                  />
                  
                  {/* Home Marker */}
                  <Marker position={[HOME_LAT, HOME_LNG]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">🏠 Safe Zone Center</p>
                        <p className="text-sm text-gray-600">Radius: {SAFE_ZONE_RADIUS}m</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Device Marker */}
                  {data && (
                    <Marker position={[data.lat, data.lng]}>
                      <Popup>
                        <div>
                          <p className="font-semibold">{data.card_id}</p>
                          <p>❤️ {data.heartrate || 'N/A'} BPM</p>
                          <p>💨 {data.spo2 || 'N/A'}%</p>
                          <p>📍 {data.lat.toFixed(6)}, {data.lng.toFixed(6)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(data.receivedAt).toLocaleString()}
                          </p>
                          {isOutsideSafeZone && (
                            <p className="text-red-500 font-semibold">⚠️ Outside safe zone!</p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Waiting for location data...</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>🏠 Home: {HOME_LAT}, {HOME_LNG}</span>
                <span>📍 Device: {data?.lat ? `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}` : 'N/A'}</span>
                {data && (
                  <span>
                    📏 Distance: {calculateDistance(HOME_LAT, HOME_LNG, data.lat || 0, data.lng || 0).toFixed(0)}m
                    {isOutsideSafeZone && ' ⚠️ OUTSIDE'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Data Section - 1/3 width */}
          <div className="lg:col-span-1 space-y-4">
            {/* Latest Data Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-3 dark:text-white">📊 Live Data</h2>
              {data ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Device</span>
                    <span className="font-medium dark:text-white">{data.card_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">❤️ Heart Rate</span>
                    <span className={`font-medium ${data.heartrate > 100 ? 'text-red-500' : 'text-green-500'}`}>
                      {data.heartrate || 'N/A'} BPM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">💨 SpO2</span>
                    <span className={`font-medium ${data.spo2 < 95 ? 'text-red-500' : 'text-green-500'}`}>
                      {data.spo2 || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">📍 Location</span>
                    <span className="font-medium dark:text-white text-sm">
                      {data.lat ? `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">🚗 Speed</span>
                    <span className="font-medium dark:text-white">{data.speed || 0} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">📏 Distance</span>
                    <span className={`font-medium ${isOutsideSafeZone ? 'text-red-500' : 'text-green-500'}`}>
                      {data.lat ? `${calculateDistance(HOME_LAT, HOME_LNG, data.lat, data.lng).toFixed(0)}m` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">🕐 Last Update</span>
                    <span className="font-medium dark:text-white text-sm">
                      {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">⚠️ Fall Detected</span>
                    <span className={`font-medium ${data.fallDetected ? 'text-red-500' : 'text-green-500'}`}>
                      {data.fallDetected ? '⚠️ YES' : '✅ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">🆘 Button Alert</span>
                    <span className={`font-medium ${data.btn_alert ? 'text-red-500' : 'text-green-500'}`}>
                      {data.btn_alert ? '🚨 YES' : '✅ No'}
                    </span>
                  </div>
                  {isOutsideSafeZone && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-center">
                      <p className="text-red-700 dark:text-red-300 font-semibold text-sm">
                        ⚠️ OUTSIDE SAFE ZONE!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              )}
            </div>

            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-semibold mb-2 dark:text-white">📡 Status</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Connection</span>
                  <span className={connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>
                    {connectionStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Safe Zone</span>
                  <span className={isOutsideSafeZone ? 'text-red-500' : 'text-green-500'}>
                    {isOutsideSafeZone ? '❌ Outside' : '✅ Inside'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Data Points</span>
                  <span className="dark:text-white">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Next Update</span>
                  <span className="dark:text-white">{countdown}s</span>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-semibold mb-2 dark:text-white">📜 History (Last 10)</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {history.slice(0, 10).map((item, index) => (
                  <div key={index} className="text-xs flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(item.receivedAt).toLocaleTimeString()}
                    </span>
                    <span className="dark:text-white">
                      ❤️ {item.heartrate || 'N/A'} 💨 {item.spo2 || 'N/A'}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No history yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}