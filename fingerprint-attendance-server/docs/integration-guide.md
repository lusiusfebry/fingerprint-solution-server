# Panduan Integrasi Perangkat

Dokumen ini menjelaskan cara menghubungkan mesin fingerprint (ZKTeco/Solution) ke sistem dan bagaimana proses sinkronisasi data bekerja.

## Persiapan Perangkat

Sistem ini dirancang untuk bekerja dengan perangkat yang kompatibel dengan protokol ZK (misalnya: Solution X105-D, ZKTeco iClock series).

### Konfigurasi Mesin
1.  **IP Address**: Pastikan mesin memiliki IP statis yang dapat dijangkau oleh server aplikasi.
2.  **Port**: Default port komunikasi adalah `4370`.
3.  **Communication Key**: Jika diatur pada mesin, pastikan nilainya sama dengan yang didaftarkan di dashboard (Default: `0`).
4.  **Gateway**: Pastikan gateway mesin mengarah ke router yang benar jika server berada di subnet berbeda.

## Mekanisme Sinkronisasi

Aplikasi menggunakan kombinasi *Pull* dan *Push* untuk menjaga keselarasan data.

### 1. Sinkronisasi Log (Pull)
Server akan menarik data transaksi dari mesin ke basis data lokal.
-   **Tipe**: `pull_logs`
-   **Data**: Waktu absensi, ID karyawan (PIN), tipe verifikasi, dan status masuk/keluar.

### 2. Sinkronisasi Karyawan (Push)
Server mengirimkan data profil karyawan (NIK dan Nama) ke mesin.
-   **Tipe**: `push_employees`
-   **Tujuan**: Agar nama muncul di layar mesin saat karyawan melakukan absensi.

### 3. Sinkronisasi Template (Push)
Server mengirimkan data sidik jari yang tersimpan di server ke mesin.
-   **Tipe**: `push_templates`
-   **Kegunaan**: Memungkinkan karyawan melakukan absensi di mesin manapun tanpa harus daftar ulang (Enrollment) di setiap mesin.

## Resolusi Konflik (Conflict Resolution)

Saat melakukan sinkronisasi karyawan atau template, terdapat dua mode resolusi:

1.  **Server Override (Default)**: Data di server dianggap yang paling benar. Jika ada perbedaan, data di mesin akan ditimpa.
2.  **Device Override**: Jika data sudah ada di mesin, server tidak akan mengirimkan data tersebut untuk menghindari duplikasi atau perubahan yang tidak diinginkan di mesin.

## Troubleshooting Koneksi

Jika status perangkat "Offline":
-   Cek kabel LAN dan konektivitas jaringan (coba `ping` IP mesin dari server).
-   Pastikan `comm_key` sudah sesuai.
-   Cek apakah port `4370` diblokir oleh firewall server/computer.
-   Gunakan fitur "Test Connection" pada menu Devices untuk melihat pesan error spesifik.
