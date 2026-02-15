# Tutorial Penggunaan Aplikasi Fingerprint Attendance

Dokumen ini berisi panduan instalasi, konfigurasi database, cara menjalankan aplikasi, dan informasi credential login untuk sistem Manajemen Absensi Fingerprint.

## 1. Persyaratan Sistem
Sebelum memulai, pastikan perangkat Anda sudah terinstal perangkat lunak berikut:
- **Node.js**: Versi 18 atau lebih baru.
- **PostgreSQL**: Versi 14 atau lebih baru.
- **NPM**: Versi 9 atau lebih baru (biasanya terikut dengan Node.js).

## 2. Struktur Proyek
Proyek ini terdiri dari dua bagian utama:
- `fingerprint-attendance-server`: Backend API berbasis NestJS dan TypeORM.
- `fingerprint-attendance-dashboard`: Frontend Dashboard berbasis Next.js 15+ dan Tailwind CSS.

## 3. Langkah Instalasi

### Backend (Server)
1. Masuk ke direktori server:
   ```bash
   cd fingerprint-attendance-server
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Siapkan file environment:
   - Copy file `.env.example` menjadi `.env` (atau buat file `.env` baru).
   - Pastikan konfigurasi database di dalamnya sesuai dengan sistem Anda.

### Frontend (Dashboard)
1. Masuk ke direktori dashboard:
   ```bash
   cd fingerprint-attendance-dashboard
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```

## 4. Konfigurasi Database

1. **Buat Database**: Buka interface PostgreSQL (seperti pgAdmin atau psql) dan buat database baru bernama `fingerprint_attendance`.
2. **Setup .env**: Buka file `fingerprint-attendance-server/.env` dan sesuaikan nilainya:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=isi_password_anda
   DB_DATABASE=fingerprint_attendance
   ```
3. **Jalankan Migrasi**: Buat struktur tabel secara otomatis dengan perintah:
   ```bash
   cd fingerprint-attendance-server
   npm run migration:run
   ```
4. **Seed Data**: Isi data awal yang diperlukan (seperti Role 'Super Admin' dan Akun User pertama):
   ```bash
   npm run seed
   ```

## 5. Cara Menjalankan Aplikasi

Anda perlu menjalankan kedua service (Server & Dashboard) secara bersamaan di dua terminal yang berbeda.

### Menjalankan Backend
```bash
cd fingerprint-attendance-server
npm run start:dev
```
*Backend akan berjalan di [http://localhost:3000](http://localhost:3000). Dokumentasi API Interaktif (Swagger) dapat diakses di [http://localhost:3000/api/docs](http://localhost:3000/api/docs).*

### Menjalankan Frontend
```bash
cd fingerprint-attendance-dashboard
npm run dev
```
*Dashboard akan berjalan di [http://localhost:3001](http://localhost:3001).*

## 6. Credential Login Default

Gunakan kredensial berikut untuk masuk ke dashboard pertama kali:

| Field | Keterangan |
|-------|------------|
| **Username** | `admin` |
| **Password** | `Admin123!` |
| **Level** | Super Admin |

> [!WARNING]
> Sangat disarankan untuk segera mengubah password default ini melalui menu pengaturan setelah berhasil login.

## 7. Fitur Umum & Troubleshooting
- **Sinkronisasi Otomatis**: Backend dikonfigurasi untuk menarik log dari mesin fingerprint setiap 5 menit secara otomatis (bisa diatur di `.env`).
- **Koneksi Mesin**: Pastikan IP Address mesin fingerprint dapat dijangkau dari server. Jika menggunakan server lokal, pastikan firewall tidak memblokir port 4370 (default port mesin).
- **Log Error**: Jika terjadi error, Anda bisa mengecek log di folder `fingerprint-attendance-server/logs`.

---
*Created by Antigravity AI Engine*
