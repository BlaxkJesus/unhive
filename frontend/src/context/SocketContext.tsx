import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCampus } from './CampusContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrder: (orderNumber: string) => void;
  leaveOrder: (orderNumber: string) => void;
  joinAdmin: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentCampus } = useCampus();

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to UniHive Real-time Engine:', socketInstance.id);
      setIsConnected(true);
      if (currentCampus?.slug) {
        socketInstance.emit('join_campus', currentCampus.slug);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected && currentCampus?.slug) {
      socket.emit('join_campus', currentCampus.slug);
    }
  }, [currentCampus, socket, isConnected]);

  const joinOrder = (orderNumber: string) => {
    if (socket && isConnected) {
      socket.emit('join_order', orderNumber);
    }
  };

  const joinAdmin = () => {
    if (socket && isConnected) {
      socket.emit('join_admin');
    }
  };

  const leaveOrder = (_orderNumber: string) => {
    // Socket.io leave logic if needed
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrder,
        leaveOrder,
        joinAdmin,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
