import { useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function WebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  const connectToWebSocket = () => {
    if (socketRef.current?.connected) return;

    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketId(socket.id ?? null);
      setMessage('Connected to WebSocket server ✅');
    });

    socket.on('welcome', (data: { message?: string }) => {
      if (data?.message) setMessage(data.message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setSocketId(null);
      setMessage('Disconnected from server ❌');
    });

    socketRef.current = socket;
  };

  const disconnectFromWebSocket = () => {
    socketRef.current?.disconnect();
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>WebSocket Test</h1>

      <button
        onClick={connectToWebSocket}
        disabled={isConnected}
        style={{ marginRight: '0.75rem', padding: '0.6rem 1rem' }}
      >
        Connect
      </button>

      <button
        onClick={disconnectFromWebSocket}
        disabled={!isConnected}
        style={{ padding: '0.6rem 1rem' }}
      >
        Disconnect
      </button>

      <p style={{ marginTop: '1rem' }}>
        Status: <strong>{isConnected ? 'Connected' : 'Not connected'}</strong>
      </p>

      {socketId && (
        <p>
          Socket ID: <code>{socketId}</code>
        </p>
      )}

      {message && <p>Message: {message}</p>}
    </main>
  );
}

export default WebSocket;