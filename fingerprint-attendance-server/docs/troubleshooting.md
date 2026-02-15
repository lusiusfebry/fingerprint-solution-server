# Panduan Troubleshooting

Dokumen ini berisi solusi untuk masalah umum yang mungkin muncul saat mengoperasikan sistem Fingerprint Attendance.

## Masalah Koneksi Perangkat

### 1. Mesin Berstatus "Offline"
- **Penyebab**: IP mesin berubah atau kabel jaringan terputus.
- **Solusi**: 
    - Pastikan kabel LAN terpasang dan lampu indikator menyala.
    - Cek apakah IP mesin sudah benar dengan menekan tombol **Menu > Network** pada mesin fisik.
    - Pastikan firewall server tidak memblokir port `4370`.

### 2. Error: "Connection Timeout / Refused"
- **Penyebab**: Server tidak dapat menjangkau mesin dalam waktu yang ditentukan.
- **Solusi**:
    - Pastikan IP mesin statis (bukan DHCP).
    - Cek apakah ada konflik IP di jaringan.
    - Coba `ping` IP mesin dari terminal server tempat aplikasi berjalan.

## Masalah Sinkronisasi Data

### 3. Log Absensi Tidak Muncul di Dashboard
- **Penyebab**: Penjadwal (scheduler) otomatis berhenti atau antrian (queue) penuh.
- **Solusi**:
    - Cek status scheduler di menu **Sync History**. Klik "Start Scheduler" jika berhenti.
    - Lakukan "Pull Logs" secara manual melalui menu Devices.
    - Periksa tab "Queue Status" untuk melihat apakah ada pekerjaan yang macet (Failed).

### 4. Nama Karyawan Tidak Muncul di Layar Mesin
- **Penyebab**: Data karyawan belum di-push ke mesin.
- **Solusi**:
    - Pilih karyawan di menu Karyawan, lalu klik aksi "Sync to Device".
    - Pilih mesin tujuan dan gunakan opsi "Push Employee".

## Masalah Autentikasi & Aplikasi

### 5. Error: "401 Unauthorized" secara Tiba-tiba
- **Penyebab**: Token akses kadaluarsa dan refresh token juga sudah tidak berlaku.
- **Solusi**:
    - Logout dari dashboard dan login kembali untuk mendapatkan token baru.
    - Jika error berlanjut, pastikan waktu (jam/tanggal) di server dan komputer Anda sudah sinkron.

### 6. Aplikasi Terasa Lambat (Resource High)
- **Penyebab**: Terdapat terlalu banyak antrian sinkronisasi yang gagal dan mencoba ulang (retry) terus menerus.
- **Solusi**:
    - Buka menu **Sync History**, klik "Clear Queue" untuk menghapus antrian yang menumpuk.
    - Matikan sementara scheduler otomatis, hapus mesin yang bermasalah, lalu nyalakan kembali.
