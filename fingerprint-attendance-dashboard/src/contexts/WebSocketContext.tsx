"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { webSocketService } from '@/services/websocket.service';
import { useAuth } from '@/hooks/useAuth';

interface WebSocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
    socket: null,
    isConnected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token, isAuthenticated } = useAuth(); // Assuming useAuth exists

    useEffect(() => {
        if (isAuthenticated && token) {
            const socketInstance = webSocketService.connect(token);
            setTimeout(() => setSocket(socketInstance), 0);

            socketInstance.on('connect', () => {
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                setIsConnected(false);
            });

            return () => {
                webSocketService.disconnect();
            };
        }
    }, [isAuthenticated, token]);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
