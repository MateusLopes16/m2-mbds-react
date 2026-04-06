import './Game.scss'
import Player from './Player'
import Board from './Board'
import { useWebSocket } from '../../service/WebSocket'

function Game() {
    const { currentGame, activePlayerName, currentCard, currentPlayerName, placeCard } = useWebSocket()

    if (!currentGame || !currentGame.players) {
        return <div>Loading...</div>
    }

    const players = currentGame.players.map((player) => ({
        name: player.name,
        color: player.color,
        active: player.name === activePlayerName,
        point1: player.score == 1 ? true : false,
        point2: player.score == 2 ? true : false,
    }));

    const numPlayers = players.length;

    // Arrange players based on player count
    const getPlayerAtPosition = (position: number) => {
        if (numPlayers === 2) {
            // 2 players: positions 0 (top) and 3 (bottom)
            if (position === 0 || position === 3) {
                return players[position === 0 ? 0 : 1];
            }
            return null; // Disabled spots at positions 1 and 2
        } else if (numPlayers === 3) {
            // 3 players: positions 0 (top), 1 (left), 2 (right)
            if (position <= 2) {
                return players[position];
            }
            return null; // Disabled spot at position 3
        } else if (numPlayers === 4) {
            // 4 players: all positions
            return players[position];
        }
        return null;
    };

    const renderPlayerSpot = (playerIndex: number) => {
        const player = getPlayerAtPosition(playerIndex);
        
        if (player) {
            const cardValue = player.active && currentCard ? currentCard.value : '';
            return (
                <Player 
                    key={player.name} 
                    name={player.name} 
                    color={player.color} 
                    vertical={playerIndex === 1 || playerIndex === 2} 
                    active={player.active}
                    point1={player.point1} 
                    point2={player.point2} 
                    currentCard={cardValue} 
                    activeCardColor={player.active && currentCard ? currentCard.color : undefined}
                    isPlayingActive={!!activePlayerName}
                />
            );
        } else {
            return (
                <Player 
                    key={`empty-${playerIndex}`}
                    name="Empty Spot" 
                    color="gray" 
                    vertical={playerIndex === 1 || playerIndex === 2}
                    active={false} 
                    point1={false} 
                    point2={false} 
                    currentCard='' 
                    isPlayingActive={!!activePlayerName}
                />
            );
        }
    };

    const handleCellClick = (x: number, y: number) => {
        if (!currentCard) {
            console.log('No card to place');
            return;
        }

        const placement = {
            card: currentCard,
            position: { x, y },
        };

        placeCard(placement);
    };

    return (
        <div className="game-container">
            <div className="top">
                {renderPlayerSpot(0)}
            </div>
            <div className="center">
                {renderPlayerSpot(1)}
                <Board board={currentGame.board} currentCardColor={currentCard?.color || ''} isCurrentPlayerTurn={currentPlayerName === activePlayerName} onCellClick={handleCellClick} />
                {renderPlayerSpot(2)}
            </div>
            <div className="bottom">
                {renderPlayerSpot(3)}
            </div>
        </div>
    )
}

export default Game