Berikut adalah **AI Prompt lengkap dan terstruktur** yang bisa Anda gunakan untuk generate spesifikasi fitur aplikasi server untuk mesin **Fingerprint Solution X105D**.

Prompt ini sudah disesuaikan dengan kebutuhan Anda sebelumnya (multi device, LAN, sinkronisasi terpusat, scalable, dan bisa dikembangkan menjadi bagian dari sistem HR).

---

## ✅ AI PROMPT – Aplikasi Server Sinkronisasi Fingerprint X105D

Gunakan prompt berikut ke AI builder / code generator Anda:

---

### 🎯 PROMPT START

Saya ingin membuat aplikasi server untuk mesin fingerprint tipe **Fingerprint Solution X105D** yang terkoneksi melalui jaringan LAN.

Tujuan aplikasi ini adalah menjadikan server sebagai pusat data (centralized system), sehingga semua mesin fingerprint akan melakukan sinkronisasi data ke server dan tidak lagi menyimpan data utama secara terpisah.

### 🎯 Objective Utama:

1. Semua data karyawan tersimpan di server.
2. Semua mesin fingerprint otomatis sinkron ke server.
3. Tidak ada perbedaan data antar mesin.
4. Server dapat push data ke semua device.
5. Sistem scalable dan bisa dikembangkan menjadi bagian dari HR System.

---

# 📌 Fitur yang Harus Ada

## 1️⃣ Device Management Module

* Registrasi mesin fingerprint:

  * Device Name
  * Serial Number
  * IP Address
  * Port
  * Location
  * Status (Online/Offline)
  * Last Sync Time
* Auto-detect device dalam LAN
* Monitoring status device real-time
* Test connection button
* Restart device dari server
* Sync manual button

---

## 2️⃣ Employee Management Module

* Master data karyawan:

  * NIK
  * Nama
  * Departemen
  * Jabatan
  * Status aktif/nonaktif
* Upload fingerprint template ke server
* Push template ke semua device
* Update karyawan otomatis ke semua device
* Hapus karyawan dari semua device jika resign
* Import data dari Excel

---

## 3️⃣ Fingerprint Template Management

* Download template dari device
* Upload template ke device tertentu
* Merge template dari beberapa device
* Validasi duplikasi fingerprint
* Version control template

---

## 4️⃣ Attendance Log Module

* Auto pull attendance log dari semua device
* Realtime attendance capture (jika device support)
* Manual pull log
* Log validation
* Anti duplicate check
* Mapping ke jadwal kerja
* Export ke Excel
* API endpoint untuk integrasi ke HR System

---

## 5️⃣ Synchronization Engine

* Auto sync setiap X menit
* Conflict resolution system:

  * Server override mode
  * Device override mode
* Log histori sinkronisasi
* Error log
* Retry mechanism jika gagal

---

## 6️⃣ Schedule & Shift Management (Optional Advanced)

* Master shift kerja
* Mapping karyawan ke shift
* Toleransi keterlambatan
* Perhitungan keterlambatan otomatis

---

## 7️⃣ Security & Access Control

* Login multi-user
* Role:

  * Super Admin
  * HR
  * IT
* Audit trail
* Log aktivitas user

---

## 8️⃣ Dashboard Monitoring

* Total device online/offline
* Total karyawan
* Total absensi hari ini
* Grafik kehadiran
* Alert jika device offline

---

# 📡 Technical Requirements

* Backend:

  * Node.js / NestJS / .NET / Laravel (pilih yang stabil untuk socket TCP)
* Database:

  * PostgreSQL
* Communication:

  * TCP/IP protocol sesuai SDK Fingerprint Solution
* Architecture:

  * Modular architecture
  * REST API ready
  * Support WebSocket untuk realtime
* Deployment:

  * Windows Server local
  * Future ready for cloud

---

# 🔄 Workflow Sistem

1. Admin input data karyawan di server
2. Server push data ke semua device
3. Device kirim log absensi ke server
4. Server simpan ke database
5. HR dapat export atau integrasi ke payroll

---

# 📊 Non Functional Requirements

* Support minimal 10 device
* Support 1000+ karyawan
* Response time < 2 detik
* Data integrity terjamin
* Backup otomatis harian

---

# 🔮 Future Expansion

* Integrasi ke Face Recognition
* Mobile app monitoring
* API untuk integrasi ke ERP
* Multi branch support
* Cloud sync hybrid mode

---

### 🎯 OUTPUT YANG SAYA INGINKAN DARI AI:

1. ERD database
2. Struktur folder backend
3. Struktur API
4. Diagram arsitektur sistem
5. Roadmap development
6. Contoh struktur tabel utama

### 🎯 PROMPT END

