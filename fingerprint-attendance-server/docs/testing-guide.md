# Testing & Optimization Guide

Dokumen ini menjelaskan prosedur pengujian dan strategi optimasi untuk Fingerprint Attendance Server.

## 1. Unit Testing

Unit test difokuskan pada logika bisnis di level service.

**Perintah:**
```bash
npm run test
```

**KPI:**
- Coverage Minimal: 80% (Statements, Branches, Functions, Lines)
- Critical Services: `EmployeesService`, `SyncEngineService`, `AuthService`, `AttendanceLogsService`.

## 2. Integration Testing (E2E)

E2E test memverifikasi aliran data dari API hingga Database menggunakan database test yang terpisah.

**Persiapan:**
1. Buat database `fingerprint_attendance_test`.
2. Update `.env` jika diperlukan.

**Perintah:**
```bash
npm run test:e2e
```

## 3. Load Testing

Memastikan sistem tetap stabil saat diakses banyak perangkat/pengguna secara bersamaan.

**Target Performa:**
- API Response Time: < 2s (95th percentile)
- Sync Duration: < 5 menit untuk 1000 karyawan.
- Concurrent Devices: 10+ devices.

**Perintah:**
```bash
npm run test:load
```

## 4. Optimization Checklists

- [x] Database Indexes (Migration 1771112500000)
- [x] Log Rotation (Winston)
- [x] Memory Monitoring (Performance Script)
- [x] Production Config (optimized JWT & DB pool)
