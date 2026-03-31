import './Lobby.scss';
import { useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function Lobby() {
    const [activeTab, setActiveTab] = useState(''); const [gameId, setGameId] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
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
            <div className="card">
                <div className="header">
                    <div className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" x2="10" y1="11" y2="11"></line><line x1="8" x2="8" y1="9" y2="13"></line><line x1="15" x2="15.01" y1="12" y2="12"></line><line x1="18" x2="18.01" y1="10" y2="10"></line><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path></svg>
                    </div>
                    <h1 className="title">Punto Lobby</h1>
                    <div className="subtitle">Créez ou rejoignez une partie pour commencer à jouer !</div>
                </div>
                <div className="content">
                    <label className="player-name" htmlFor="playerName">NOM DU JOUEUR</label>
                    <div className="input-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        <input type="text" id="playerName" placeholder="Entrez votre nom" />
                    </div>
                    <div className="options-container">
                        <div className={`create options ${activeTab === 'create' ? 'selected' : ''}`} onClick={() => setActiveTab('create')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                            <span>Créer une partie</span>
                        </div>
                        <div className={`join options ${activeTab === 'join' ? 'selected' : ''}`} onClick={() => setActiveTab('join')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg>
                            <span>Rejoindre une partie</span>
                        </div>
                    </div>
                </div>
                {activeTab === "create" && (
                    <div className="footer">
                        <div className="text">
                            Creez une nouvelle partie et invitez vos amis à rejoindre en partageant le Game ID unique généré pour votre session de jeu.
                        </div>
                        <button className="full-button" onClick={handleCreateGame}>Créer une nouvelle partie</button>
                    </div>
                )}
                {activeTab === "join" && (
                    <div className="footer">
                        <label className="id-label" htmlFor="gameId">Game ID</label>
                        <div className="input-container">
                            <input type="text" id="gameId" placeholder="Entrez le Game ID" value={gameId} onChange={(e) => setGameId(e.target.value.toUpperCase())} />
                        </div>
                        <button className="full-button" onClick={handleJoinGame}>Rejoindre la partie</button>
                    </div>
                )}
                {!activeTab && (
                    <div className="footer">
                        <div className="text">
                            Sélectionnez une option ci-dessus pour continuer
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Lobby;