import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Game, Player, RoomConnection } from './WebSocketObjects';


const SOCKETSERVERURL = 'http://localhost:3000';

type WebSocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
  currentGame: Game | null;
  currentPlayerName: string;
  connectToWebSocket: (roomId: string, playerName: string) => Socket;
  disconnectFromWebSocket: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const socketRef = useRef<Socket | null>(null);

  //get or create a socket connection
  const getOrCreateSocket = (roomId: string, playerName: string): Socket => {
    if (socketRef.current) return socketRef.current;

    const activeSocket = io(SOCKETSERVERURL, {
      transports: ['websocket'],
      autoConnect: false,
      query: { roomId },
    });

    registerSocketEvents(activeSocket, roomId, playerName);
    socketRef.current = activeSocket;
    return activeSocket;
  };

  //connect to a room to the websocket server
  const connectToWebSocket = (roomId: string, playerName: string): Socket => {
    setCurrentPlayerName(playerName);
    const activeSocket = getOrCreateSocket(roomId, playerName);
    if (!activeSocket.connected) activeSocket.connect();
    return activeSocket;
  };

  const registerSocketEvents = (activeSocket: Socket, roomId: string, playerName: string) => {
    activeSocket.on('connect', () => {
      setIsConnected(true);
      setSocketId(activeSocket.id ?? null);
      const room: RoomConnection = {
        id: roomId,
        player: {
          name: playerName,
          score: 0,
          color: '',
          isHost: false,
        } as Player,
      };
      emitMessage('joinRoom', room);
    });

    activeSocket.on('disconnect', () => {
      setIsConnected(false);
      setSocketId(null);
      setCurrentGame(null);
    });

    activeSocket.on('joinedRoom', (game: Game) => {
      setCurrentGame(game);
      console.log('Joined room:', game.id);
    });

    activeSocket.on('addPlayerToRoom', (player: Player) => {
      setCurrentGame((previousGame) => {
        if (!previousGame) return previousGame;
        const playerAlreadyExists = previousGame.players.some((existingPlayer) => existingPlayer.name === player.name);
        if (playerAlreadyExists) return previousGame;

        return {
          ...previousGame,
          players: [...previousGame.players, player],
        };
      });
      console.log('Player added to room:', player.name);
    });
  };

  const disconnectFromWebSocket = () => {
    socketRef.current?.disconnect();
    setCurrentGame(null);
  };

  const emitMessage = (eventName: string, payload: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current?.emit(eventName, payload);
      return;
    }
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
      socketId,
      currentGame,
      currentPlayerName,
      connectToWebSocket,
      disconnectFromWebSocket,
    }),
    [isConnected, socketId, currentGame, currentPlayerName],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }

  return context;
}

export default WebSocketProvider;