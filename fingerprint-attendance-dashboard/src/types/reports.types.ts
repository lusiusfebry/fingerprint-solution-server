export interface AttendanceTrendData {
    date: string;
    attendance: number;
    expected: number;
}

export interface AbsenceBreakdownData {
    name: string;
    value: number;
    color: string;
}

export interface Latecomer {
    rank: number;
    employee_id: string;
    employee_name: string;
    department: string;
    last_incident: string;
    total_late_minutes: number;
    incident_count: number;
}

export interface MonthlyStats {
    avg_attendance_rate: number;
    total_late_arrivals: number;
    total_overtime_hours: number;
    top_performing_dept: string;
}
