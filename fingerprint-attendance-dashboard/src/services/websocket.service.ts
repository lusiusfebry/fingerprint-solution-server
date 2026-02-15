import { io, Socket } from 'socket.io-client';

class WebSocketService {
    private socket: Socket | null = null;
    private url: string;

    constructor() {
        this.url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    }

    connect(token?: string): Socket {
        if (this.socket) {
            return this.socket;
        }

        this.socket = io(`${this.url}/devices`, {
            auth: {
                token: token,
            },
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }
}

export const webSocketService = new WebSocketService();
