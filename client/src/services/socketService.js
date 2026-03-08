import { io } from 'socket.io-client';

let socket;

export const connectSocket = ({ token, userId }) => {
  if (!token || !userId) return null;
  if (socket?.connected) return socket;

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const serverUrl = apiBase.replace(/\/api\/?$/, '');

  socket = io(serverUrl, {
    autoConnect: true,
    transports: ['websocket'],
    auth: { token }
  });

  socket.on('connect', () => {
    socket.emit('join:user', userId);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
