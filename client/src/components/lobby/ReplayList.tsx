import type { PlayerObject } from '../../service/WebSocketObjects';
import Replay from './Replay';
import './ReplayList.scss';

interface ReplayListProps {
    gameIdFilter: string;
    selectedReplayId: number | null;
    onSelectReplay: (replay: ReplayItem) => void;
}

interface ReplayItem {
    id: number;
    name: string;
    date: string;
    nbTourns: number;
    players: PlayerObject[];
    winner: PlayerObject;
}

function ReplayList({ gameIdFilter, selectedReplayId, onSelectReplay }: ReplayListProps) {

    const replays: ReplayItem[] = [
        {
            id: 111111, name: 'AZYRBC', date: '01/01/2024', nbTourns: 10, players: [
                { name: 'Player 1', color: ['orange'], score: 0, isHost: false },
                { name: 'Player 2', color: ['blue'], score: 0, isHost: false },
                { name: 'Player 3', color: ['green', 'yellow'], score: 0, isHost: false },
            ] as PlayerObject[],
            winner: { name: 'Player 1', color: ['orange'], score: 0, isHost: false } as PlayerObject
        },
        {
            id: 222222, name: 'AZYRBA', date: '02/01/2024', nbTourns: 15, players: [
                { name: 'Player 1', color: ['red'], score: 0, isHost: false },
                { name: 'Player 2', color: ['blue'], score: 0, isHost: false },
            ] as PlayerObject[],
            winner: { name: 'Player 1', color: ['red'], score: 0, isHost: false } as PlayerObject
        },
        {
            id: 333333, name: 'AZYRBB', date: '03/01/2024', nbTourns: 20, players: [
                { name: 'Player 1', color: ['red'], score: 0, isHost: false },
                { name: 'Player 2', color: ['blue'], score: 0, isHost: false },
            ] as PlayerObject[],
            winner: { name: 'Player 1', color: ['red'], score: 0, isHost: false } as PlayerObject
        },
        {
            id: 333333, name: 'AZERTY', date: '03/01/2024', nbTourns: 20, players: [
                { name: 'Player 1', color: ['red'], score: 0, isHost: false },
                { name: 'Player 2', color: ['blue'], score: 0, isHost: false },
            ] as PlayerObject[],
            winner: { name: 'Player 1', color: ['red'], score: 0, isHost: false } as PlayerObject
        },
        {
            id: 333333, name: 'ZZZZZZ', date: '03/01/2024', nbTourns: 20, players: [
                { name: 'Player 1', color: ['red'], score: 0, isHost: false },
                { name: 'Player 2', color: ['blue'], score: 0, isHost: false },
            ] as PlayerObject[],
            winner: { name: 'Player 1', color: ['red'], score: 0, isHost: false } as PlayerObject
        },
    ];

    const normalizedFilter = gameIdFilter.trim().toUpperCase();
    const filteredReplays = replays.filter((replay) => replay.name.includes(normalizedFilter));

    return (
        <div className="replay-list">
            {replays.map((replay, index) => {
                const isVisible = replay.name.includes(normalizedFilter);

                return (
                    <div
                        key={replay.id}
                        className={`replay-row ${isVisible ? 'visible' : 'hidden'}`}
                        style={{ transitionDelay: `${index * 40}ms` }}
                    >
                        <Replay
                            players={replay.players}
                            gameId={replay.name}
                            date={replay.date}
                            nbTours={replay.nbTourns}
                            winner={replay.winner}
                            isSelected={selectedReplayId === replay.id}
                            onSelect={isVisible ? () => onSelectReplay(replay) : undefined}
                        />
                    </div>
                );
            })}
            {filteredReplays.length === 0 && (
                <div className="replay-list-empty">Aucun replay correspondant.</div>
            )}
        </div>
    );
}

export default ReplayList;