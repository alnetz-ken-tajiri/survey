"use client"

// hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NOTIFY') {
        setNotifications((prev) => [...prev, data.data]);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(connect, 3000);
    };

    setSocket(ws);
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return { notifications };
}