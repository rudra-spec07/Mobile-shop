import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. If unauthenticated or token missing, disconnect any existing socket and reset state
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Determine backend socket server URL
    const rawApiUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socketBaseUrl = rawApiUrl.replace(/\/api\/v1\/?$/, '').trim().replace(/\/$/, '');

    // 2. Prevent duplicate connection if socket already exists for this exact token
    if (socketRef.current) {
      if (socketRef.current.auth?.token === token && socketRef.current.connected) {
        return;
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // 3. Initialize single Socket.IO client instance with failure-isolation
    let socketInstance = null;
    try {
      socketInstance = io(socketBaseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        autoConnect: true,
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        setIsConnected(false);
        console.warn('⚠️ [SOCKET CONNECT WARNING]:', err?.message || err);
      });
    } catch (err) {
      console.warn('⚠️ [SOCKET INITIALIZATION ERROR]:', err?.message || err);
      setIsConnected(false);
    }

    // 4. Cleanup socket connection on component unmount or auth token change
    return () => {
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.disconnect();
      }
      if (socketRef.current === socketInstance) {
        socketRef.current = null;
      }
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
