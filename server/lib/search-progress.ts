import { WebSocket } from 'ws';

interface SearchProgressUpdate {
  barcode: string;
  currentSource: string;
  completedSources: string[];
  found: boolean;
  error?: string;
}

const activeConnections = new Map<string, WebSocket[]>();

export function addProgressConnection(barcode: string, ws: WebSocket) {
  if (!activeConnections.has(barcode)) {
    activeConnections.set(barcode, []);
  }
  activeConnections.get(barcode)!.push(ws);
  
  ws.on('close', () => {
    removeProgressConnection(barcode, ws);
  });
}

export function removeProgressConnection(barcode: string, ws: WebSocket) {
  const connections = activeConnections.get(barcode);
  if (connections) {
    const index = connections.indexOf(ws);
    if (index > -1) {
      connections.splice(index, 1);
    }
    if (connections.length === 0) {
      activeConnections.delete(barcode);
    }
  }
}

export function broadcastSearchProgress(barcode: string, update: SearchProgressUpdate) {
  const connections = activeConnections.get(barcode);
  if (connections) {
    const message = JSON.stringify(update);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}