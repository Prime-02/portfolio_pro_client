"use client"
// contexts/WebSocketContext.tsx
import { createContext, useContext } from 'react';
import { useWebSocket } from './components/utilities/hooks/wesocketHook';
import { UseWebSocketReturn } from './components/types and interfaces/NotificationsInterface';

const WebSocketContext = createContext<UseWebSocketReturn | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const webSocket = useWebSocket();
  
  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};