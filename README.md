
# Exam Cheating Detection and Monitoring System

A real-time IoT-based examination monitoring system that detects unauthorized Wi-Fi hotspots and suspicious wireless devices during examinations using an ESP32 microcontroller. The system uploads detected signals to Firebase Firestore and provides a live web dashboard for monitoring and alerting invigilators.

---

## Features

- Real-time Wi-Fi scanning using ESP32
- Detects unauthorized Wi-Fi hotspots
- RSSI-based proximity detection
- Multiple siren levels based on signal strength
- LED visual indicators
- Real-time Firebase Firestore integration
- Live React dashboard
- Search and filter detected devices
- Start/Stop scanning remotely
- Department, Year, and Room selection
- Automatic cloud synchronization

---

## System Architecture

```
ESP32
   │
   │ Wi-Fi Scan
   ▼
Unauthorized Device Detection
   │
   ├── Green LED
   ├── Red LED
   ├── Buzzer Alert
   │
   ▼
Firebase Firestore
   │
   ▼
React Dashboard
```

---

## Technologies Used

### Hardware

- ESP32 Development Board
- Active Buzzer
- Green LED
- Red LED

### Software

- Arduino IDE
- React.js
- Firebase Firestore
- Tailwind CSS
- JavaScript
- HTML5
- CSS3

### Libraries

#### ESP32

- WiFi.h
- HTTPClient.h
- ArduinoJson

#### React

- React Router
- Firebase SDK
- Context API

---

## Project Structure

```
Exam-Cheating-System/
│
├── esp32/
│   └── scanner.ino
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── firebase/
│   └── context/
│
└── README.md
```

---

## How It Works

1. The administrator starts scanning from the web dashboard.
2. ESP32 receives the command from Firebase.
3. ESP32 scans nearby Wi-Fi networks.
4. Authorized Wi-Fi networks are ignored.
5. Unauthorized networks are detected.
6. Signal information is uploaded to Firestore.
7. The dashboard updates in real time.
8. The buzzer alarm changes according to RSSI strength.

---

## RSSI Alert Levels

| RSSI | Level | Alert |
|------|-------|-------|
| ≤ -75 dBm | Far | Slow Beep |
| -75 to -65 dBm | Medium | Double Beep |
| -65 to -50 dBm | Close | Triple Beep |
| > -50 dBm | Very Close | Continuous Siren |

---

## Dashboard Features

- Live monitoring
- Search by SSID
- Search by MAC Address
- Risk level filtering
- Delete records
- Delete all records (Admin)
- Start/Stop scanning
- Real-time updates

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/exam-cheating-system.git
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

### Run the project

```bash
npm run dev
```

---

## ESP32 Setup

1. Open the Arduino sketch.
2. Install the required libraries.
3. Configure:

- Wi-Fi SSID
- Wi-Fi Password
- Firebase Project ID
- Firebase API Key

4. Upload the code to the ESP32.

---

## Future Improvements

- BLE device detection
- Device fingerprinting
- MAC spoofing detection
- Multiple ESP32 scanners
- Email and SMS notifications
- AI-based anomaly detection
- Interactive location mapping
- Detection history and analytics

---

## Limitations

- Detects Wi-Fi signals only
- Cannot identify the device owner
- RSSI is an approximate distance indicator
- Vulnerable to MAC address spoofing
- Requires internet connectivity for cloud synchronization

---

## Author

**Tewodros**

Computer Engineering Graduate

GitHub: https://github.com/yourusername

LinkedIn: https://linkedin.com/in/yourprofile

---

## License

This project is licensed under the MIT License.
