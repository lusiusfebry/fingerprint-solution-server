# Dokumentasi Event WebSocket

Aplikasi menggunakan Socket.io untuk pengiriman data real-time dari server ke dashboard (Web Panel).

## Koneksi
- **Namespace**: `/devices`
- **Port**: Sama dengan port API (default: 3001)
- **CORS**: Diizinkan untuk semua origin dalam lingkungan development.

## Daftar Event

### 1. Status Perangkat (`device:status`)
Dikirim setiap kali ada perubahan status koneksi atau aktivitas pada mesin fingerprint.

**Payload:**
```json
{
  "deviceId": "uuid-string",
  "status": "online | offline | syncing | error",
  "isOnline": true,
  "timestamp": "2023-10-27T10:00:00Z"
}
```

### 2. Progres Sinkronisasi (`device:sync:progress`)
Memberikan informasi persentase progres saat proses sinkronisasi (push employee/template) sedang berlangsung.

**Payload:**
```json
{
  "deviceId": "uuid-string",
  "progress": 45,
  "message": "Pushing templates (45/100)"
}
```

### 3. Siklus Sinkronisasi
Event yang menandakan tahapan proses sinkronisasi.

- **`sync:started`**: Proses sinkronisasi dimulai.
- **`sync:completed`**: Proses selesai dengan sukses.
- **`sync:failed`**: Proses gagal.

**Payload (Completed):**
```json
{
  "deviceId": "uuid-string",
  "syncType": "pull_logs",
  "recordsCount": 150,
  "timestamp": "2023-10-27T10:05:00Z"
}
```

### 4. Absensi Baru (`attendance:new`)
Dikirim secara real-time setiap kali ada data absensi baru yang masuk ke server (biasanya dipicu secara manual atau otomatis pull).

**Payload:**
```json
{
  "log": {
    "id": "uuid",
    "employee_id": "uuid",
    "timestamp": "2023-10-27T08:00:00Z",
    "verify_type": 1,
    "in_out_mode": 0
  },
  "timestamp": "2023-10-27T08:00:05Z"
}
```

### 5. Update Antrian (`sync:queue:update`)
Memberitahu jumlah antrian pekerjaan sinkronisasi yang sedang menunggu.

**Payload:**
```json
{
  "pending": 2,
  "processing": 1,
  "completedToday": 10,
  "failedToday": 0
}
```
