# Strategi Versi API

Aplikasi ini mengikuti prinsip *Semantic Versioning (SemVer)* untuk mengelola pembaruan sistem dan API.

## Format Versi: `MAJOR.MINOR.PATCH`

### 1. MAJOR (`X.0.0`)
Pembaruan yang mengandung perubahan tidak kompatibel (*breaking changes*) pada API.
- Contoh: Penghapusan endpoint lama, perubahan struktur response yang drastis, atau perubahan mekanisme autentikasi.

### 2. MINOR (`0.X.0`)
Pembaruan yang menambahkan fungsionalitas baru dengan cara yang tetap kompatibel dengan klien lama (*backward-compatible*).
- Contoh: Penambahan modul baru, endpoint baru, atau properti opsional baru dalam JSON response.

### 3. PATCH (`0.0.X`)
Pembaruan yang berisi perbaikan bug (*bug fixes*) atau optimasi internal yang tetap kompatibel.

## Perubahan Mendatang (Deprecation Policy)
Setiap endpoint yang direncanakan untuk dihapus akan:
1. Ditandai sebagai `@deprecated` dalam dokumen Swagger.
2. Tetap tersedia minimal untuk satu versi minor rilis sebelum benar-benar dihapus pada versi Major berikutnya.

## Prefix URL
Saat ini, semua API menggunakan prefix `/api`. 
Rencana ke depan jika diperlukan versi paralel:
- `/api/v1/...`
- `/api/v2/...`
*(Implementasi saat ini masih menggunakan base `/api` tunggal)*.
