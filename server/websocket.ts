import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

const wss = new WebSocketServer({ port: 3001 });

const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const companyId = req.url?.split('=')[1];

  if (!companyId) {
    ws.close();
    return;
  }

  if (!clients.has(companyId)) {
    clients.set(companyId, new Set());
  }

  clients.get(companyId)?.add(ws);

  ws.on('message', (message: Buffer) => {
    const data = JSON.parse(message.toString());
    
    // Broadcast to all clients of the same company
    clients.get(data.companyId)?.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on('close', () => {
    clients.get(companyId)?.delete(ws);
    if (clients.get(companyId)?.size === 0) {
      clients.delete(companyId);
    }
  });
});

console.log('WebSocket server is running on port 3001');