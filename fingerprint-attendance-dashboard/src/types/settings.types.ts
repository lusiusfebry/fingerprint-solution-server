export interface SystemSettings {
    app_name: string;
    sync_interval: number;
    conflict_resolution_mode: 'server' | 'device';
    max_retry_attempts: number;
    notification_email: string;
    maintenance_mode: boolean;
    auto_backup_enabled: boolean;
    backup_schedule: string;
    email_notifications_enabled: boolean;
    sms_notifications_enabled: boolean;
    notification_recipients: string[];
}

export interface BackupHistory {
    id: string;
    filename: string;
    file_path: string;
    size_bytes: number;
    type: 'manual' | 'auto';
    status: 'success' | 'failed';
    created_at: string;
    created_by: string;
}

export interface SystemInfo {
    server_status: 'online' | 'offline';
    version: string;
    database_status: 'connected' | 'disconnected';
    cpu_usage: number;
    memory_usage: {
        total: number;
        used: number;
        free: number;
        percent: number;
    };
    uptime: number;
    last_backup: string | null;
    counts: {
        devices: number;
        employees: number;
        logs: number;
    };
}

export interface HealthCheck {
    status: string;
    timestamp: string;
}
