import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the server URL dynamically to match the current origin
    const apiUrl = new URL(window.location.origin);
    apiUrl.port = '3000'; // Backend always runs on port 3000
    
    const socketInstance = io(apiUrl.toString(), {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socketInstance.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Handle navigation events from the server
    socketInstance.on('navigate', (path: string) => {
      console.log('Navigating to:', path);
      navigate(path);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [navigate]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
