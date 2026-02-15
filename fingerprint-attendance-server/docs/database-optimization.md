# Database Optimization Guide

Dokumen ini menjelaskan strategi optimasi basis data untuk menangani volume data absensi yang besar dan sinkronisasi banyak perangkat.

## 1. Indexing Strategy

Index ditambahkan pada kolom-kolom berikut untuk mempercepat query:

- **Employees**:
  - `nik`: Digunakan untuk lookup cepat saat sinkronisasi dan import.
  - `status`: Mempercepat query karyawan aktif.
  - Partial Index `status = 'aktif'`: Mengoptimalkan filter rutin.
- **Attendance Logs**:
  - `timestamp`: Mendukung query rentang tanggal yang cepat untuk perhitungan absensi.
  - `(employee_id, timestamp)`: Mengoptimalkan pencarian log per karyawan.
- **Sync History**:
  - `(device_id, timestamp)`: Mempercepat pengambilan riwayat sinkronisasi terakhir per perangkat.

## 2. Query Optimization

- **Selective Selection**: Selalu gunakan `.select(['id', 'nama', ...])` untuk membatasi jumlah data yang ditarik dari DB.
- **Batch Processing**: Sinkronisasi data karyawan dilakukan dalam chunk (misal: 100 record per batch) untuk menghindari memory overflow.
- **Raw Queries for Aggregations**: Gunakan query mentah atau query builder khusus untuk laporan ringkasan bulanan yang melibatkan ribuan baris.

## 3. Recommended PostgreSQL Settings (Production)

Untuk mendukung 1000+ karyawan dan 10+ perangkat secara bersamaan:

| Parameter | Nilai Rekomendasi |
|-----------|-------------------|
| `shared_buffers` | 25% dari RAM Total |
| `effective_cache_size` | 75% dari RAM Total |
| `work_mem` | 16MB |
| `max_connections` | 100 - 200 |
| `maintenance_work_mem` | 256MB |

## 4. Maintenance Tasks

- **VACUUM ANALYZE**: Jalankan secara periodik (sekali seminggu) untuk membersihkan data lama dan memperbarui statistik optimizer.
- **REINDEX**: Lakukan reindex pada table `attendance_logs` jika performa query melambat seiring pertumbuhan data.
