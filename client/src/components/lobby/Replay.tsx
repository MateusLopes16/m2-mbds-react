import type { PlayerObject } from '../../service/WebSocketObjects';
import './Replay.scss';
import PlayerIcon from './PlayerIcon';

interface ReplayProps {
    players: PlayerObject[];
    gameId: string;
    date: string;
    nbTours: number;
    winner: PlayerObject;
    isSelected?: boolean;
    onSelect?: () => void;
}

function Replay({ players, gameId, date, nbTours, winner, isSelected = false, onSelect }: ReplayProps) {
    return (
        <div
            className={`replay ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
            onKeyDown={(event) => {
                if (!onSelect) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect();
                }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
        >
            <div className="top">
                <span className="game-id">{gameId}</span>
                <span className="date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                    {date}
                </span>
            </div>
            <div className="bottom">
                <div className="players">
                    {players.map((player, index) => (
                        <PlayerIcon key={index} name={player.name} color={player.color} isWinner={player.name === winner?.name} />
                    ))}
                </div>
                <span className="nb-tours">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
                    {nbTours} tours
                </span>
            </div>
        </div>
    )
}

export default Replay;