// hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // 接続後に通知を取得するアクションを送信
      ws.send(JSON.stringify({ action: 'fetchNotifications' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NOTIFY') {
        setNotifications(data.data);
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