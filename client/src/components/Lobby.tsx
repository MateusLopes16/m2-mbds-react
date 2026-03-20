import './Lobby.css';
import { useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function Lobby() {
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const socketRef = useRef<Socket | null>(null);
    const [count, setCount] = useState(0);

    const handleCreateGame = () => {
        if (socketRef.current?.connected) return;

        const socket = io('http://localhost:3000', {
            transports: ['websocket'],
        });

        registerSocketEvents(socket);
        socketRef.current = socket;
    };

    const handleJoinGame = () => {
        if (socketRef.current?.connected) return;

        const socket = io('http://localhost:3000', {
            transports: ['websocket'],
        });

        registerSocketEvents(socket);
        socketRef.current = socket;
    };

    const handleDisconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    const registerSocketEvents = (socket: Socket) => {
        socket.on('connect', () => {
            socket.emit("playerJoinGame", { idSession: "test-room-1" });
        });

        socket.on("updateUserCount", (count) => {
            setIsConnected(true);
            setSocketId(socket.id ?? null);
            setMessage('Connected to WebSocket server ✅');
            setCount(count);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            setSocketId(null);
            setMessage('Disconnected from server ❌');
        });
    };

    return (
        <div className="lobby">
            <header className="lobby-header">
                <h1>🎮 Punto Game</h1>
                <p>Create or join a game to start playing</p>
                <div>{count}</div>
                <div>{isConnected ? 'Connected' : 'Disconnected'}</div>
                <div>{message}</div>
            </header>

            <main className="lobby-cards">
                <section className="lobby-card">
                    <h2 className="lobby-card-create-title">Create New Game</h2>
                    <p>Start a new game and invite others to join</p>
                    <input type="text" placeholder="Enter your name" />
                    <button onClick={handleCreateGame}>Create Game</button>
                </section>

                <section className="lobby-card">
                    <h2 className="lobby-card-join-title">Join Existing Game</h2>
                    <p>Join a game using its ID and play with others</p>
                    <input type="text" placeholder="Enter game ID" />
                    <input type="text" placeholder="Enter your name" />
                    <button onClick={handleJoinGame}>Join Game</button>
                </section>
            </main>
            <button onClick={handleDisconnect}>Disconnect</button>

            <footer className="lobby-footer">
                <p>Welcome to Punto Game</p>
            </footer>
        </div>
    );
}

export default Lobby;