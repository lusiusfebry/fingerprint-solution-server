# Fingerprint Attendance Server

## Deskripsi
Fingerprint Attendance Server adalah sistem backend berbasis NestJS yang dirancang untuk mengelola mesin absensi fingerprint (Solution/ZKTeco). Sistem ini menyediakan API untuk sinkronisasi data karyawan, penarikan log absensi secara real-time, manajemen shift kerja, dan integrasi dengan sistem HR pihak ketiga.

## Fitur Utama
- **Manajemen Perangkat**: Monitoring status, sinkronisasi waktu, dan restart mesin secara remote.
- **Sinkronisasi Data**: Penarikan log absensi otomatis dan pengiriman data karyawan ke mesin.
- **WebSocket Real-time**: Notifikasi instan saat terjadi pemindaian jari di mesin.
- **Kalkulasi Kehadiran**: Perhitungan jam kerja, keterlambatan, dan status kehadiran berdasarkan shift.
- **Integrasi HR**: REST API yang mudah diintegrasikan dengan sistem HR/ERP eksternal.

## Panduan & Dokumentasi (Bahasa Indonesia)
Daftar panduan lengkap tersedia di dalam folder `docs/`:
- [Skema Basis Data](docs/database-schema.md) - ER Diagram dan deskripsi tabel.
- [Panduan Integrasi HR](docs/integration-guide.md) - Contoh kode Node.js, PHP, dan Python.
- [Referensi API (Swagger)](docs/api-reference.md) - Cara mengakses dokumentasi interaktif.
- [Dokumentasi WebSocket](docs/websocket-events.md) - Event yang tersedia untuk real-time update.
- [Panduan Deployment Windows](docs/deployment-guide.md) - Langkah instalasi di Windows Server dengan IIS & PM2.
- [Troubleshooting](docs/troubleshooting.md) - Solusi masalah umum koneksi dan sinkronisasi.
- [Strategi Versi API](docs/api-versioning.md) - Kebijakan perubahan versi API.
- [Postman Collection](docs/postman-collection.json) - Koleksi endpoint untuk pengujian cepat.

## Cara Menjalankan Proyek

### Persyaratan
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (Untuk antrian sinkronisasi)

### Instalasi
```bash
$ npm install
```

### Pengembangan (Development)
```bash
# Salin file environment
$ cp .env.example .env

# Jalankan server
$ npm run start:dev
```

### Produksi (Production)
```bash
# Build aplikasi
$ npm run build

# Jalankan dengan PM2
$ pm2 start dist/main.js --name fingerprint-server
```

## Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).

