export interface Permission {
    id: string;
    module: string;
    action: string;
    created_at: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: 'active' | 'inactive';
    last_login: string;
    created_at: string;
}

// Pagination Interface
export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
    user: User | null;
    user_name?: string; // For display if user is null
    module: string;
    action: string;
    description: string;
    ip_address: string;
    request_data?: Record<string, unknown>;
    response_status?: number;
}

export interface AuditLogFilters {
    page: number;
    limit: number;
    module?: string;
    severity?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}
