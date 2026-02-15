export interface Employee {
    id: string;
    nama: string;
    nik: string;
    departemen?: string;
    jabatan?: string;
    status: 'aktif' | 'nonaktif';
    fingerprint_count?: number;
    // Add other properties
}

export interface CreateEmployeeDto {
    nama: string;
    nik: string;
    departemen?: string;
    jabatan?: string;
    status?: 'aktif' | 'nonaktif';
}

export interface UpdateEmployeeDto {
    nama?: string;
    nik?: string;
    departemen?: string;
    jabatan?: string;
    status?: 'aktif' | 'nonaktif';
}
