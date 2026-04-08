import './Leaderboard.scss';
import { useWebSocket } from '../../service/WebSocket'
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import LeaderboardPlayer from './LeaderboardPlayer';
import type { GameObject } from '../../service/WebSocketObjects';

function Leaderboard() {
    const { currentGame, currentPlayerName, disconnectFromWebSocket } = useWebSocket()
    const navigate = useNavigate()

    const winner = currentGame?.players?.find(p => p.name === currentPlayerName);

    const isWinner = currentGame?.players?.find(p => p.name === currentPlayerName)?.score === 2;
    // Determine if the current player is the winner
    const { currentGameResult, currentResultContent } = useMemo(() => {
        if (!currentGame || !currentGame.players) {
            return { currentGameResult: '', currentResultContent: '' };
        }

        // Find the current player in the game
        const currentPlayer = currentGame.players.find(p => p.name === currentPlayerName);
        const playerPoints = currentPlayer?.score || 0;
        const winner = currentGame.players.reduce((prev, current) => (prev.score > current.score) ? prev : current).name;

        // Check if player won (has 2 points)
        if (playerPoints >= 2) {
            return {
                currentGameResult: 'Victoire!',
                currentResultContent: 'Bravo, tu as gagné la partie!'
            };
        } else {
            return {
                currentGameResult: 'Perdant',
                currentResultContent: winner + ' a gagné la partie'
            };
        }
    }, [currentGame, currentPlayerName])

    const returnToLobby = () => {
        if (!currentGame) return;
        disconnectFromWebSocket();
        navigate('/');
    }

    return (
        <div className="leaderboard">
            <div className="header">
                {isWinner ? (
                    <>
                        <div className={`circle winner ${winner?.color[0]}`}>
                            <svg className="trophy" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>
                            <svg className="crown" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path><path d="M5 21h14"></path></svg>
                        </div>
                    </>
                ) : (
                    <div className="circle looser">
                        <svg className="smiley" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                    </div>
                )}
                <div className={`title ${isWinner ? 'winner' : 'looser'} ${winner?.color[0]}`}>{currentGameResult}</div>
                <div className="subtitle">{currentResultContent}</div>
            </div>
            <div className="content">
                <div className="players">
                    {currentGame?.players
                        .sort((a, b) => (b.score || 0) - (a.score || 0))
                        .map((player, index) => (
                            <LeaderboardPlayer key={player.name} player={player} index={index} isWinner={player.name === currentPlayerName} />
                        ))}
                </div>
            </div>
            <div className="footer">
                <button className="full-button" onClick={returnToLobby}>Retour au lobby</button>
            </div>
        </div>
    )
}

export default Leaderboard;