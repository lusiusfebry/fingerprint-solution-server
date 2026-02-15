# Panduan Deployment

Dokumen ini menjelaskan langkah-langkah untuk memasang dan menjalankan sistem Fingerprint Attendance di lingkungan produksi, dengan fokus khusus pada lingkungan Windows Server.

## Persyaratan Sistem
- **Node.js**: Versi 18 atau lebih baru (LTS direkomendasikan).
- **Basis Data**: PostgreSQL 14 atau lebih baru.
- **RAM**: Minimal 2GB (direkomendasikan 4GB).
- **OS**: Windows Server 2016+ atau Linux (Ubuntu 20.04+).

## Instalasi di Windows Server

### 1. Persiapan Lingkungan
1.  **Node.js**: Unduh dan instal installer `.msi` dari [nodejs.org](https://nodejs.org).
2.  **PostgreSQL**: Instal PostgreSQL dan buat basis data `fingerprint_attendance`.
3.  **Git**: Instal Git for Windows jika ingin melakukan penarikan kode langsung dari repository.

### 2. Konfigurasi Backend & Dashboard
Ikuti langkah persiapan pada bagian umum di bawah (Variabel Lingkungan & Build).

### 3. Manajemen Proses (PM2 di Windows)
Agar aplikasi berjalan sebagai Windows Service dan otomatis aktif saat reboot:
```powershell
# Install PM2 secara global
npm install pm2 -g

# Install PM2 Windows Service
npm install pm2-windows-service -g

# Daftarkan aplikasi
pm2 start dist/main.js --name "fg-server"
pm2 save
```

### 4. IIS sebagai Reverse Proxy (Opsional)
Jika ingin menggunakan port 80/443 dengan domain:
1.  Instal **Application Request Routing (ARR)** dan **URL Rewrite** di IIS.
2.  Buat Website baru atau gunakan Default Web Site.
3.  Tambahkan aturan URL Rewrite untuk meneruskan trafik ke `http://localhost:3001`.

### 5. Aturan Firewall
Buka port berikut pada Windows Firewall:
- `3001`: Backend API.
- `5432`: PostgreSQL (jika diakses dari luar).
- `4370`: Protokol ZK (UDP/TCP) untuk komunikasi mesin.

## Langkah Instalasi Umum

### 1. Persiapan Basis Data
```sql
CREATE DATABASE fingerprint_attendance;
```

### 2. Konfigurasi Variabel Lingkungan (.env)
Sesuaikan `DB_HOST`, `DB_USER`, `DB_PASS`, dan `JWT_SECRET`.

### 3. Build & Run
```bash
# Server
cd fingerprint-attendance-server
npm install
npm run build
npm run start:prod

# Dashboard
cd fingerprint-attendance-dashboard
npm install
npm run build
```

## Maintenance & Backup di Windows

### Otomatisasi Backup (PowerShell)
Simpan script berikut sebagai `backup.ps1` dan jalankan via Task Scheduler:
```powershell
$env:PGPASSWORD = "password_anda"
pg_dump -h localhost -U postgres -d fingerprint_attendance > "C:\Backup\db_$(get-date -f yyyyMMdd).sql"
```

### Update Aplikasi
1. `git pull`
2. `npm install`
3. `npm run build`
4. `pm2 restart fg-server`
