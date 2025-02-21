// hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const connect = useCallback(() => {
    if (!url) return;
    
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ action: 'fetchNotifications' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NOTIFY') {
        setNotifications(data.data);
        setIsLoading(false);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsLoading(true);  // 接続が切れたらローディング状態に戻す
      setTimeout(() => connect(), 3000);
    };

    setSocket(ws);
  }, [url]);

  useEffect(() => {
    if (url) {
      connect();
    }
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [url, connect]);

  return { notifications, isLoading };
}