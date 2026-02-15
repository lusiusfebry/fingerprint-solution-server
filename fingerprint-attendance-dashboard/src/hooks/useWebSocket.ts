import { useWebSocket as useWS } from '@/contexts/WebSocketContext';
import { useEffect } from 'react';
import { Device } from '@/types/device.types';
import { AttendanceLog } from '@/types/attendance.types';

export const useWebSocket = () => {
    return useWS();
};

export function useDeviceStatus(callback: (device: Device) => void) {
    const { socket } = useWebSocket();
    useEffect(() => {
        if (!socket) return;
        socket.on('device:status', callback);
        return () => {
            socket.off('device:status', callback);
        };
    }, [socket, callback]);
}

export function useAttendanceUpdates(callback: (log: AttendanceLog) => void) {
    const { socket } = useWebSocket();
    useEffect(() => {
        if (!socket) return;
        socket.on('attendance:new', callback);
        return () => {
            socket.off('attendance:new', callback);
        };
    }, [socket, callback]);
};
