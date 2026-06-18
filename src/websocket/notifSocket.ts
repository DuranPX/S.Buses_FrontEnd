import { io } from 'socket.io-client';

const MS_NOTIFICATIONS_URL = import.meta.env.VITE_MS_NOTIFICATIONS_URL || 'http://localhost:5002';

// Socket separado para ms-notifications
export const notifSocket = io(MS_NOTIFICATIONS_URL, {
    autoConnect: false,
    transports: ['websocket'],
});

export const connectNotifSocket = (token: string) => {
    if (notifSocket.connected) return;
    notifSocket.auth = { token };
    notifSocket.connect();
};

export const disconnectNotifSocket = () => {
    if (notifSocket.connected) notifSocket.disconnect();
};