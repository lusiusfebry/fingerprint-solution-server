export interface AttendanceLog {
    id: string;
    log_id: string; // for display
    timestamp: string;
    employee_id: string;
    employee_name?: string; // for display
    employee_nik?: string;
    department?: string;
    device_id: string;
    device_name?: string;
    device_location?: string;
    status: 'present' | 'late' | 'absent';
    verify_type?: string;
    in_out_mode?: 'check-in' | 'check-out';
}

export interface AttendanceSummary {
    present_count: number;
    late_count: number;
    absent_count: number;
    total_expected: number;
    attendance_rate?: number;
}

export interface AttendanceFilters {
    search?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
    device?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
