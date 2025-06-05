import { WebSocket } from 'ws';

interface SearchProgressUpdate {
  type: 'progress' | 'error' | 'complete';
  barcode: string;
  currentSource: string;
  completedSources: string[];
  found: boolean;
  error?: string;
  totalSources?: number;
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

export function broadcastSearchProgress(barcode: string, update: Omit<SearchProgressUpdate, 'barcode'>) {
  const connections = activeConnections.get(barcode);
  if (connections) {
    const fullUpdate = { ...update, barcode };
    const message = JSON.stringify(fullUpdate);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

export type { SearchProgressUpdate };