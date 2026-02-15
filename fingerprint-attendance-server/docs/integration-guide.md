# Panduan Integrasi Sistem HR / ERP

Dokumen ini menjelaskan cara mengintegrasikan sistem HR atau ERP pihak ketiga dengan Fingerprint Attendance Server menggunakan REST API dan WebSocket.

## Persyaratan Integrasi
1.  **Base URL**: `http://<server-ip>:3001/api`
2.  **Autentikasi**: Bearer Token (JWT).
3.  **Format Data**: JSON.

## Alur Integrasi Utama

### 1. Autentikasi
Sebelum melakukan permintaan lain, sistem Anda harus mendapatkan token akses.
-   **Endpoint**: `POST /auth/login`
-   **Payload**: `{ "username": "...", "password": "..." }`

### 2. Sinkronisasi Data Karyawan (Admin/HR)
Anda dapat mengirim data karyawan dari sistem HR ke server ini agar terdaftar di mesin fingerprint.
-   **Endpoint**: `POST /employees/import` (Batch) atau `POST /employees` (Single).
-   **Payload (Single)**:
    ```json
    {
      "nik": "123456",
      "nama": "Budi Santoso",
      "departemen": "Produksi",
      "jabatan": "Operator",
      "status": "aktif"
    }
    ```

### 3. Pengambilan Log Absensi
Sistem HR dapat menarik log absensi secara periodik atau berdasarkan filter tertentu.
-   **Endpoint**: `GET /attendance/logs`
-   **Parameter Query**: `startDate`, `endDate`, `employeeId`, `deviceId`.

## Contoh Kode Integrasi

### Node.js (axios)
```javascript
const axios = require('axios');

async function syncAttendance() {
  // 1. Login
  const auth = await axios.post('http://localhost:3001/api/auth/login', {
    username: 'admin',
    password: 'password123'
  });
  const token = auth.data.access_token;

  // 2. Ambil Log
  const logs = await axios.get('http://localhost:3001/api/attendance/logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: { startDate: '2023-10-01', endDate: '2023-10-31' }
  });
  
  console.log(logs.data);
}
```

### PHP (cURL)
```php
<?php
$ch = curl_init('http://localhost:3001/api/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'username' => 'admin',
    'password' => 'password123'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = json_decode(curl_exec($ch), true);
$token = $response['access_token'];

// Pull Logs
$ch = curl_init('http://localhost:3001/api/attendance/logs?startDate=2023-10-01');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token
]);
$logs = curl_exec($ch);
echo $logs;
?>
```

### Python (Requests)
```python
import requests

# 1. Login
login_url = "http://localhost:3001/api/auth/login"
creds = {"username": "admin", "password": "password123"}
response = requests.post(login_url, json=creds)
token = response.json().get("access_token")

# 2. Get Logs
logs_url = "http://localhost:3001/api/attendance/logs"
headers = {"Authorization": f"Bearer {token}"}
params = {"startDate": "2023-10-01"}
logs = requests.get(logs_url, headers=headers, params=params)
print(logs.json())
```

## Real-time Notifications (WebSocket)
Untuk mendapatkan data absensi langsung saat terjadi (real-time), gunakan `socket.io-client`.

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001/devices');

socket.on('attendance:new', (data) => {
  console.log('Absensi Baru Terdeteksi:', data);
  // Proses data ke sistem HR Anda
});
```
