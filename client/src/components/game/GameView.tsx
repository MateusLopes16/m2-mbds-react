import './Game.scss'
import { useEffect, useState, type ReactNode } from 'react'
import Player from './Player'
import Board from './board/Board'
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

function GameView({ currentGame, activePlayerName, currentCard, winningLine, lastPlacedPosition, currentPlayerName, placeCard }: GameViewProps) {
    const [isMobileLayout, setIsMobileLayout] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.innerWidth < 600;
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(max-width: 599px)');

        const handleMediaChange = (event: MediaQueryListEvent) => {
            setIsMobileLayout(event.matches);
        };

        setIsMobileLayout(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            mediaQuery.removeEventListener('change', handleMediaChange);
        };
    }, []);

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

    const renderPlayerSpot = (playerIndex: number): ReactNode => {
        const player = getPlayerAtPosition(playerIndex);

        if (!player) {
            return <Player
                key={`empty-${playerIndex}`}
                name={''}
                color={''}
                vertical={!isMobileLayout && (playerIndex === 1 || playerIndex === 2)}
                active={false}
                point1={false}
                point2={false}
                currentCard={''}
                activeCardColor={''}
                isPlayingActive={false}
                hidden={true}
            />;
        }

        const cardValue = player.active && currentCard ? currentCard.value : '';
        return (
            <Player
                key={player.name}
                name={player.name}
                color={player.color}
                vertical={!isMobileLayout && (playerIndex === 1 || playerIndex === 2)}
                active={player.active}
                point1={player.point1}
                point2={player.point2}
                currentCard={cardValue}
                activeCardColor={player.active && currentCard ? currentCard.color : undefined}
                isPlayingActive={!!activePlayerName}
            />
        );
    };

    const topPlayer = renderPlayerSpot(0);
    const leftPlayer = renderPlayerSpot(1);
    const rightPlayer = renderPlayerSpot(2);
    const bottomPlayer = renderPlayerSpot(3);
    const mobilePlayers = [topPlayer, leftPlayer, rightPlayer, bottomPlayer];

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
        <div className={`game-container ${isMobileLayout ? 'mobile-layout' : ''}`}>
            {!isMobileLayout && topPlayer && <div className="top">{topPlayer}</div>}
            <div className="center">
                {!isMobileLayout && leftPlayer}
                <div className="board-shell">
                    <Board board={currentGame.board} currentCardColor={currentCard?.color || ''} isCurrentPlayerTurn={currentPlayerName === activePlayerName} winningLine={winningLine} lastPlacedPosition={lastPlacedPosition} onCellClick={handleCellClick} />
                </div>
                {!isMobileLayout && rightPlayer}
            </div>
            {isMobileLayout && (
                <div className="mobile-side-players">
                    {mobilePlayers}
                </div>
            )}
            {!isMobileLayout && bottomPlayer && <div className="bottom">{bottomPlayer}</div>}
        </div>
    )
}

export default GameView
