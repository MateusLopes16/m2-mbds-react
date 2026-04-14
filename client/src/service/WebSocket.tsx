import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import type {
    BoardPositionObject,
    CardObject,
    GameUpdatedEventObject,
    GameObject,
    ScoredLineEventObject,
    PlayerObject,
    RoomConnectionObject,
    TurnObject,
    PlacementObject,
} from "./WebSocketObjects";
import Swal from "sweetalert2";

const SOCKETSERVERURL = import.meta.env.VITE_SOCKETSERVERURL;

type WebSocketContextType = {
    socket: Socket | null;
    isConnected: boolean;
    socketId: string | null;
    currentGame: GameObject | null;
    currentPlayerName: string;
    activePlayerName: string | null;
    currentCard: CardObject | null;
    winningLine: BoardPositionObject[] | null;
    lastPlacedPosition: BoardPositionObject | null;
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
    const [currentPlayerName, setCurrentPlayerName] = useState("");
    const [, setCurrentPlayerColor] = useState("");
    const [activePlayerName, setActivePlayerName] = useState<string | null>(
        null,
    );
    const [currentCard, setCurrentCard] = useState<CardObject | null>(null);
    const [winningLine, setWinningLine] = useState<BoardPositionObject[] | null>(
        null,
    );
    const [lastPlacedPosition, setLastPlacedPosition] = useState<BoardPositionObject | null>(
        null,
    );
    const socketRef = useRef<Socket | null>(null);
    const placementAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const navigate = useNavigate();
    const [, setPlayers] = useState<PlayerObject[]>([]);

    const normalizeScoredLinePayload = (
        payload: GameObject | ScoredLineEventObject,
    ): ScoredLineEventObject => {
        if ("game" in payload && "winningLine" in payload) {
            return payload;
        }

        return {
            game: payload,
            winningLine: [],
        };
    };

    const normalizeGameUpdatedPayload = (
        payload: GameObject | GameUpdatedEventObject,
    ): GameUpdatedEventObject => {
        if ("game" in payload) {
            return payload;
        }

        return {
            game: payload,
        };
    };

    const triggerPlacedCardAnimation = (
        placedPosition?: BoardPositionObject,
    ) => {
        if (!placedPosition) {
            setLastPlacedPosition(null);
            return;
        }

        setLastPlacedPosition(placedPosition);

        if (placementAnimationTimeoutRef.current) {
            clearTimeout(placementAnimationTimeoutRef.current);
        }

        placementAnimationTimeoutRef.current = setTimeout(() => {
            setLastPlacedPosition(null);
            placementAnimationTimeoutRef.current = null;
        }, 220);
    };

    //get or create a socket connection
    const getOrCreateSocket = (roomId: string, playerName: string): Socket => {
        if (socketRef.current) return socketRef.current;

        const activeSocket = io(SOCKETSERVERURL, {
            transports: ["websocket"],
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

    const registerSocketEvents = (
        activeSocket: Socket,
        roomId: string,
        playerName: string,
    ) => {
        activeSocket.on("connect", () => {
            setIsConnected(true);
            setSocketId(activeSocket.id ?? null);
            const room: RoomConnectionObject = {
                id: roomId,
                player: {
                    name: playerName,
                    score: 0,
                    color: [""],
                    isHost: false,
                } as PlayerObject,
            };
            emitMessage("joinRoom", room);
        });

        activeSocket.on("disconnect", () => {
            setIsConnected(false);
            setSocketId(null);
            setCurrentGame(null);
            setWinningLine(null);
            setLastPlacedPosition(null);
        });

        activeSocket.on("joinedRoom", (game: GameObject) => {
            setCurrentGame(game);
            setWinningLine(null);
            setLastPlacedPosition(null);
            roomId = game.id;
            navigate("/lobby/" + roomId);
            console.log("Joined room:", game.id);
        });

        activeSocket.on("addPlayerToRoom", (player: PlayerObject) => {
            setCurrentGame((previousGame: any) => {
                if (!previousGame) return previousGame;
                const playerAlreadyExists = previousGame.players.some(
                    (existingPlayer: any) =>
                        existingPlayer.name === player.name,
                );
                if (playerAlreadyExists) return previousGame;

                return {
                    ...previousGame,
                    players: [...previousGame.players, player],
                };
            });
            console.log("Player added to room:", player.name);
        });

        activeSocket.on("gameStarted", (game: GameObject) => {
            setCurrentGame(game);
            setWinningLine(null);
            setLastPlacedPosition(null);
            setCurrentPlayerColor(
                game.players.find((player) => player.name === playerName)
                    ?.color[0] ?? "",
            );
            setPlayers(game.players);
            navigate("/game/" + roomId);
            console.log("Partie lancée", game.board);
        });

        activeSocket.on("deletePlayerInRoom", (game: GameObject) => {
            setCurrentGame(game);
        });

        activeSocket.on("gameUpdated", (payload: GameObject | GameUpdatedEventObject) => {
            const { game, placedPosition } = normalizeGameUpdatedPayload(payload);
            setCurrentGame(game);
            setWinningLine(null);
            triggerPlacedCardAnimation(placedPosition);
        });

        activeSocket.on(
            "gameEnded",
            (payload: GameObject | ScoredLineEventObject) => {
                const { game, winningLine, placedPosition } = normalizeScoredLinePayload(payload);
                setCurrentGame(game);
                setWinningLine(winningLine);
                triggerPlacedCardAnimation(placedPosition);
                setActivePlayerName(null);
                setCurrentCard(null);

                //   Add swal popup to show the winner of the game after a delay of 2 seconds, and after swall popup navigate to leaderboard
                setTimeout(() => {
                    const winner = game.players.reduce((prev, current) =>
                        prev.score > current.score ? prev : current,
                    );
                    Swal.fire({
                        icon: "success",
                        title: "Partie terminée",
                        text: `Le gagnant est ${winner.name} avec ${winner.score} points !`,
                        timer: 3000,
                        showConfirmButton: false,
                        customClass: {
                            popup: "app-swal-popup",
                            title: "app-swal-title",
                            htmlContainer: "app-swal-text",
                            confirmButton: "app-swal-confirm",
                            cancelButton: "app-swal-cancel",
                        },
                    }).then(() => {
                        navigate("/leaderboard/" + roomId);
                    });
                }, 2000);
            },
        );

        // An user scored a point, update the game state to reflect the new score
        activeSocket.on(
            "playerPoint",
            (payload: GameObject | ScoredLineEventObject) => {
                const { game, winningLine, placedPosition } = normalizeScoredLinePayload(payload);
                setCurrentGame(game);
                setWinningLine(winningLine);
                triggerPlacedCardAnimation(placedPosition);
                setActivePlayerName(null);
                setCurrentCard(null);
            },
        );

        activeSocket.on("playerTurn", (turn: TurnObject) => {
            setCurrentGame(turn.game);
            setWinningLine(null);
            setActivePlayerName(turn.card.owner.name);
            setCurrentCard(turn.card);
        });

        activeSocket.on("error", (error: { message: string }) => {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: error.message,
                customClass: {
                    popup: "app-swal-popup",
                    title: "app-swal-title",
                    htmlContainer: "app-swal-text",
                    confirmButton: "app-swal-confirm",
                    cancelButton: "app-swal-cancel",
                },
            });
            disconnectFromWebSocket();
            navigate("/home");
        });
    };

    const disconnectFromWebSocket = () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setCurrentGame(null);
        setWinningLine(null);
        setLastPlacedPosition(null);
    };

    const leaveRoom = (roomId: string) => {
        if (!roomId) return;

        emitMessage("leaveRoom", {
            id: roomId,
            playerName: currentPlayerName,
        });
    };

    const startGame = (roomId: string) => {
        if (!roomId) return;

        emitMessage("startGame", {
            id: roomId,
            playerName: currentPlayerName,
        });
    };

    const placeCard = (placement: PlacementObject) => {
        emitMessage("placeCard", placement);
    };

    const emitMessage = (eventName: string, payload: unknown) => {
        if (socketRef.current?.connected) {
            socketRef.current?.emit(eventName, payload);
            return;
        }
    };

    useEffect(() => {
        return () => {
            if (placementAnimationTimeoutRef.current) {
                clearTimeout(placementAnimationTimeoutRef.current);
                placementAnimationTimeoutRef.current = null;
            }
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
            winningLine,
            lastPlacedPosition,
            connectToWebSocket,
            leaveRoom,
            disconnectFromWebSocket,
            startGame,
            placeCard,
        }),
        [
            isConnected,
            socketId,
            currentGame,
            currentPlayerName,
            activePlayerName,
            currentCard,
            winningLine,
            lastPlacedPosition,
        ],
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
        throw new Error("useWebSocket must be used within WebSocketProvider");
    }

    return context;
}

export default WebSocketProvider;
