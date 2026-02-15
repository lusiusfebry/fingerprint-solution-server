# Referensi API

Aplikasi ini menggunakan Swagger (OpenAPI 3.0) untuk dokumentasi API yang interaktif.

## Akses Swagger UI
Setelah menjalankan server, Anda dapat mengakses dokumentasi lengkap di:
`http://localhost:3001/api-docs`

## Otentikasi
Hampir seluruh endpoint (kecuali Login & Refresh Token) membutuhkan otentikasi menggunakan **Bearer Token (JWT)**.
- **Header**: `Authorization: Bearer <your_access_token>`
- **Pendaftaran Token**: Masukkan token pada tombol **Authorize** di Swagger UI untuk mencoba endpoint secara langsung.

## Grup API Utama

### 1. Auth (`/api/auth`)
Menangani login, pendaftaran pengguna baru (jika diizinkan), logout, dan pembaruan token.

### 2. Devices (`/devices`)
Manajemen mesin fingerprint:
- Registrasi mesin baru.
- Scanning jaringan untuk deteksi otomatis.
- Test koneksi dan restart mesin secara remote.

### 3. Employees (`/api/employees`)
Manajemen data karyawan:
- Import data dari Excel.
- Upload template sidik jari.
- Penugasan jadwal (shift).

### 4. Attendance (`/attendance`)
Penarikan dan pengelolaan log absensi:
- Ambil log pukulan mentah.
- Kalkulasi kehadiran berdasarkan shift.
- Export laporan ke Excel.

### 5. System (`/api/system-settings`, `/api/system-info`, `/api/backup`)
Pengaturan global sistem, monitoring kesehatan server, dan manajemen backup basis data.

## Kode Status HTTP
- `200 OK`: Permintaan berhasil.
- `201 Created`: Data berhasil dibuat.
- `400 Bad Request`: Parameter input tidak valid.
- `401 Unauthorized`: Token tidak ada atau sudah kadaluarsa.
- `403 Forbidden`: Pengguna tidak memiliki hak akses (role tidak sesuai).
- `404 Not Found`: Data yang dicari tidak ditemukan.
- `500 Internal Server Error`: Kesalahan pada sisi server.
