import { useEffect, useMemo, useState } from 'react';
import type { PlayerObject } from '../../service/WebSocketObjects';
import Replay from './Replay';
import './ReplayList.scss';

interface ReplayListProps {
    gameIdFilter: string;
    selectedReplayId: string | null;
    onSelectReplay: (replay: ReplayItem) => void;
}

export interface ReplayItem {
    id: string;
    name: string;
    date: string;
    nbTourns: number;
    players: PlayerObject[];
    winner: PlayerObject;
}

function ReplayList({ gameIdFilter, selectedReplayId, onSelectReplay }: ReplayListProps) {
    const [replays, setReplays] = useState<ReplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_SOCKETSERVERURL || 'http://localhost:3000';

    useEffect(() => {
        const fetchReplays = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`${API_URL}/replays`);
                if (!response.ok) {
                    throw new Error('Failed to load replays');
                }

                const payload = await response.json() as Array<{
                    sessionId: string;
                    replayMoveCount?: number;
                    winner?: string | null;
                    players?: Array<{ name: string; color: string[]; isHost: boolean }>;
                    createdAt?: string;
                    updatedAt?: string;
                }>;

                const mapped = payload
                    .filter((replay) => !!replay.sessionId)
                    .map((replay) => {
                        const players: PlayerObject[] = (replay.players || []).map((player) => ({
                            name: player.name,
                            color: player.color,
                            score: 0,
                            isHost: !!player.isHost,
                        }));

                        const winnerName = replay.winner || players[0]?.name || '';
                        const winner = players.find((player) => player.name === winnerName) || {
                            name: winnerName,
                            color: ['gray'],
                            score: 0,
                            isHost: false,
                        };

                        const dateSource = replay.updatedAt || replay.createdAt;
                        const date = dateSource ? new Date(dateSource).toLocaleDateString('fr-FR') : '-';

                        return {
                            id: replay.sessionId,
                            name: replay.sessionId,
                            date,
                            nbTourns: replay.replayMoveCount || 0,
                            players,
                            winner,
                        } as ReplayItem;
                    });

                setReplays(mapped);
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Failed to load replays';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReplays();
    }, []);

    const normalizedFilter = gameIdFilter.trim().toUpperCase();
    const filteredReplays = useMemo(
        () => replays.filter((replay) => replay.name.includes(normalizedFilter)),
        [replays, normalizedFilter],
    );

    if (isLoading) {
        return <div className="replay-list"><div className="replay-list-empty">Chargement des replays...</div></div>;
    }

    if (error) {
        return <div className="replay-list"><div className="replay-list-empty">{error}</div></div>;
    }

    return (
        <div className="replay-list">
            {filteredReplays.map((replay, index) => {
                return (
                    <div
                        key={replay.id}
                        className="replay-row visible"
                        style={{ transitionDelay: `${index * 40}ms` }}
                    >
                        <Replay
                            players={replay.players}
                            gameId={replay.name}
                            date={replay.date}
                            nbTours={replay.nbTourns}
                            winner={replay.winner}
                            isSelected={selectedReplayId === replay.id}
                            onSelect={() => onSelectReplay(replay)}
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