export interface Device {
    id: string;
    ip_address: string;
    port: number;
    name: string;
    serial_number: string;
    location?: string;
    status: 'online' | 'offline' | 'semionline';
    last_activity?: string;
    last_sync_time?: string;
    comm_key?: string;
}

export interface CreateDeviceDto {
    ip_address: string;
    port: number;
    name: string;
    serial_number: string;
    location?: string;
    comm_key?: string;
}

export interface UpdateDeviceDto {
    ip_address?: string;
    port?: number;
    name?: string;
    serial_number?: string;
    location?: string;
    comm_key?: string;
}
