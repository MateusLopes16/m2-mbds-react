import './Game.scss'
import type { ReactNode } from 'react'
import Player from './Player'
import Board from './Board'
import type { BoardPositionObject, CardObject, GameObject, PlacementObject } from '../../service/WebSocketObjects'

type GameViewProps = {
    currentGame: GameObject | null;
    activePlayerName: string | null;
    currentCard: CardObject | null;
    winningLine: BoardPositionObject[] | null;
    lastPlacedPosition: BoardPositionObject | null;
    currentPlayerName: string;
    placeCard: (placement: PlacementObject) => void;
    leftBoardControl?: ReactNode;
    rightBoardControl?: ReactNode;
}

function GameView({ currentGame, activePlayerName, currentCard, winningLine, lastPlacedPosition, currentPlayerName, placeCard, leftBoardControl, rightBoardControl }: GameViewProps) {
    if (!currentGame || !currentGame.players) {
        return <div>Loading...</div>
    }

    const players = currentGame.players.map((player) => ({
        name: player.name,
        color: player.color,
        active: player.name === activePlayerName,
        point1: player.score >= 1 ? true : false,
        point2: player.score == 2 ? true : false,
    }));

    const numPlayers = players.length;

    const getPlayerAtPosition = (position: number) => {
        if (numPlayers === 2) {
            if (position === 0 || position === 3) {
                return players[position === 0 ? 0 : 1];
            }
            return null;
        } else if (numPlayers === 3) {
            if (position <= 2) {
                return players[position];
            }
            return null;
        } else if (numPlayers === 4) {
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
        }

        return (
            <Player
                key={`empty-${playerIndex}`}
                name="Empty Spot"
                color="gray"
                vertical={playerIndex === 1 || playerIndex === 2}
                active={false}
                point1={false}
                point2={false}
                currentCard=""
                isPlayingActive={!!activePlayerName}
            />
        );
    };

    const handleCellClick = (x: number, y: number) => {
        if (!currentCard) {
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
                <div className="board-shell">
                    {leftBoardControl && <div className="board-nav">{leftBoardControl}</div>}
                    <Board board={currentGame.board} currentCardColor={currentCard?.color || ''} isCurrentPlayerTurn={currentPlayerName === activePlayerName} winningLine={winningLine} lastPlacedPosition={lastPlacedPosition} onCellClick={handleCellClick} />
                    {rightBoardControl && <div className="board-nav">{rightBoardControl}</div>}
                </div>
                {renderPlayerSpot(2)}
            </div>
            <div className="bottom">
                {renderPlayerSpot(3)}
            </div>
        </div>
    )
}

export default GameView
