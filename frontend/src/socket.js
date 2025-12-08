import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

let socketInstance = null;
let currentToken = null;

export const getSocket = (token) => {
    // Nếu token thay đổi, disconnect socket cũ và tạo mới
    if (socketInstance && currentToken !== token) {
        socketInstance.disconnect();
        socketInstance = null;
    }

    if (!socketInstance && token) {
        currentToken = token;
        socketInstance = io(BACKEND_URL, {
            transports: ['websocket'],
            auth: { token },
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected, id:', socketInstance.id);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('[Socket] Connect error:', err.message);
        });
    }

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        currentToken = null;
    }
};
