import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import type { CardObject, GameObject, PlayerObject, RoomConnectionObject, TurnObject, PlacementObject } from './WebSocketObjects';
import Swal from 'sweetalert2';


const SOCKETSERVERURL = 'http://localhost:3000';

type WebSocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
  currentGame: GameObject | null;
  currentPlayerName: string;
  activePlayerName: string | null;
  currentCard: CardObject | null;
  connectToWebSocket: (roomId: string, playerName: string) => Socket;
  leaveRoom: (roomId: string) => void;
  disconnectFromWebSocket: () => void;
  startGame: (roomId: string) => void;
  placeCard: (placement: PlacementObject) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<GameObject | null>(null);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [currentPlayerColor, setCurrentPlayerColor] = useState('');
  const [activePlayerName, setActivePlayerName] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<CardObject | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerObject[]>([]);

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
      const room: RoomConnectionObject = {
        id: roomId,
        player: {
          name: playerName,
          score: 0,
          color: [''],
          isHost: false,
        } as PlayerObject,
      };
      emitMessage('joinRoom', room);
    });

    activeSocket.on('disconnect', () => {
      setIsConnected(false);
      setSocketId(null);
      setCurrentGame(null);
    });

    activeSocket.on('joinedRoom', (game: GameObject) => {
      setCurrentGame(game);
      roomId = game.id;
      navigate('/lobby/' + roomId);
      console.log('Joined room:', game.id);
    });

    activeSocket.on('addPlayerToRoom', (player: PlayerObject) => {
      setCurrentGame((previousGame: any) => {
        if (!previousGame) return previousGame;
        const playerAlreadyExists = previousGame.players.some((existingPlayer: any) => existingPlayer.name === player.name);
        if (playerAlreadyExists) return previousGame;

        return {
          ...previousGame,
          players: [...previousGame.players, player],
        };
      });
      console.log('Player added to room:', player.name);
    });

    activeSocket.on('gameStarted', (game: GameObject) => {
      setCurrentGame(game);
      setCurrentPlayerColor(game.players.find((player) => player.name === playerName)?.color[0] ?? '');
      setPlayers(game.players);
      navigate('/game/' + roomId);
      console.log('Partie lancée', game.board);
    });

    activeSocket.on('deletePlayerInRoom', (game: GameObject) => {
      setCurrentGame(game);
    });

    activeSocket.on('gameUpdated', (game: GameObject) => {
      setCurrentGame(game);
    });

    activeSocket.on('gameEnded', (game: GameObject) => {
      setCurrentGame(game);
      navigate('/leaderboard/' + roomId);
    });

    activeSocket.on('playerPoint', (game: GameObject) => {
      setCurrentGame(game);
    });

    activeSocket.on('playerTurn', (turn: TurnObject) => {
      setCurrentGame(turn.game);
      setActivePlayerName(turn.card.owner.name);
      setCurrentCard(turn.card);
    });

    activeSocket.on('error', (error: { message: string }) => {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message,
        customClass: {
          popup: 'app-swal-popup',
          title: 'app-swal-title',
          htmlContainer: 'app-swal-text',
          confirmButton: 'app-swal-confirm',
          cancelButton: 'app-swal-cancel',
        },
      });
      disconnectFromWebSocket();
    });
  };

  const disconnectFromWebSocket = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setCurrentGame(null);
  };

  const leaveRoom = (roomId: string) => {
    if (!roomId) return;

    emitMessage('leaveRoom', {
      id: roomId,
      playerName: currentPlayerName,
    });
  };

  const startGame = (roomId: string) => {
    if (!roomId) return;

    emitMessage('startGame', {
      id: roomId,
      playerName: currentPlayerName,
    });
  };

  const placeCard = (placement: PlacementObject) => {
    emitMessage('placeCard', placement);
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
      activePlayerName,
      currentCard,
      connectToWebSocket,
      leaveRoom,
      disconnectFromWebSocket,
      startGame,
      placeCard,
    }),
    [isConnected, socketId, currentGame, currentPlayerName, activePlayerName, currentCard],
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