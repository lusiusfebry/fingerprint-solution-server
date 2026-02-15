# Fingerprint Attendance Solution

Sistem manajemen absensi terpadu yang terintegrasi dengan mesin sidik jari (X105-D, ZKTeco, dll).

## Struktur Project
- `fingerprint-attendance-server`: Backend API berbasis NestJS & TypeORM.
- `fingerprint-attendance-dashboard`: UI Dashboard berbasis React & Vite.

## Dokumentasi (Bahasa Indonesia)
Kami telah menyediakan dokumentasi lengkap untuk membantu pengembangan dan operasional:

1.  **[Skema Basis Data](fingerprint-attendance-server/docs/database-schema.md)**: Struktur tabel dan ER diagram.
2.  **[Panduan Integrasi Perangkat](fingerprint-attendance-server/docs/integration-guide.md)**: Cara menghubungkan mesin sidik jari.
3.  **[Referensi API](fingerprint-attendance-server/docs/api-reference.md)**: Gambaran umum endpoint dan autentikasi.
4.  **[Dokumentasi WebSocket](fingerprint-attendance-server/docs/websocket-events.md)**: Daftar event real-time untuk dashboard.
5.  **[Panduan Deployment](fingerprint-attendance-server/docs/deployment-guide.md)**: Cara memasang aplikasi di server produksi.
6.  **[Troubleshooting](fingerprint-attendance-server/docs/troubleshooting-guide.md)**: Solusi untuk masalah umum.
7.  **[Strategi Versi API](fingerprint-attendance-server/docs/api-versioning.md)**: Kebijakan pembaruan API.

## Cara Menjalankan
Silakan merujuk ke file README masing-masing folder untuk instruksi teknis detail.
- [README Server](fingerprint-attendance-server/README.md)
- [README Dashboard](fingerprint-attendance-dashboard/README.md)
