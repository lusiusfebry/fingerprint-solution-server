# Panduan Deployment

Dokumen ini menjelaskan langkah-langkah untuk memasang dan menjalankan sistem Fingerprint Attendance di lingkungan produksi.

## Persyaratan Sistem
- **Node.js**: Versi 18 atau lebih baru.
- **Basis Data**: PostgreSQL 14 atau lebih baru.
- **RAM**: Minimal 2GB (direkomendasikan 4GB untuk sistem dengan banyak mesin).

## Langkah Instalasi

### 1. Persiapan Basis Data
Buat basis data kosong di PostgreSQL:
```sql
CREATE DATABASE fingerprint_attendance;
```

### 2. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env` di folder server dan sesuaikan nilainya:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=fingerprint_attendance

# JWT
JWT_SECRET=pilih_string_yang_sangat_kuat
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=pilih_string_refresh_kuat
JWT_REFRESH_EXPIRATION=7d

# App
PORT=3001
NODE_ENV=production
```

### 3. Build & Jalankan Server
```bash
cd fingerprint-attendance-server
npm install
npm run build
npm run start:prod
```

### 4. Build & Jalankan Dashboard
Pastikan `VITE_API_URL` pada `.env` dashboard mengarah ke IP/Domain server.
```bash
cd fingerprint-attendance-dashboard
npm install
npm run build
```
Hasil build di folder `dist` dapat dideploy menggunakan Nginx atau web server statis lainnya.

## Rekomendasi Produksi (PM2)
Gunakan PM2 untuk menjaga aplikasi tetap berjalan di background dan otomatis restart jika terjadi error.

```bash
# Install PM2 secara global
npm install pm2 -g

# Jalankan server
pm2 start dist/main.js --name "fg-server"

# Pantau log
pm2 logs fg-server
```

## Update Aplikasi
Untuk memperbarui aplikasi ke versi terbaru:
1. `git pull`
2. `npm install`
3. `npm run build`
4. `pm2 restart fg-server` (atau restart service Anda)
