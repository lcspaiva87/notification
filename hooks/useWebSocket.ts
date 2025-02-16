import { useEffect, useRef } from 'react';

export function useWebSocket(companyId: string, onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Conectar ao WebSocket
    ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001'}?companyId=${companyId}`);

    // Configurar handlers
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup na desmontagem
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [companyId, onMessage]);

  return ws.current;
} 