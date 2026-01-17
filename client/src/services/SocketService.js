import { io } from 'socket.io-client';

// Replace with your server URL
const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    joinRoom(roomID, userID) {
        if (this.socket) {
            this.socket.emit('join-room', { roomID, userID });
        }
    }

    sendSignal(to, signal) {
        if (this.socket) {
            this.socket.emit('signal', { to, signal });
        }
    }

    onUserJoined(callback) {
        if (this.socket) {
            this.socket.on('user-joined', callback);
        }
    }

    onSignalReceived(callback) {
        if (this.socket) {
            this.socket.on('signal', callback);
        }
    }

    onUserDisconnected(callback) {
        if (this.socket) {
            this.socket.on('user-disconnected', callback);
        }
    }
}

export default new SocketService();
