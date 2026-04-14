import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import GameView from './GameView'
import type { BoardCellObject, CardObject, GameObject, PlacementObject, PlayerObject } from '../../service/WebSocketObjects'
import './ReplayGame.scss'

type ReplayTurn = {
    turn?: number;
    playerName?: string;
    boardState: Array<Array<{
        type: string;
        value?: string;
        color?: string;
        owner?: string;
        isPlacable?: boolean;
    }>>;
}

type ReplayPayload = {
    sessionId: string;
    players: Array<{
        name: string;
        isHost: boolean;
        color: string[];
        cardsRemaining: number;
    }>;
    game: ReplayTurn[];
}

const API_URL = import.meta.env.VITE_SOCKETSERVERURL || 'http://localhost:3000';

function ReplayGame() {
    const { id } = useParams()
    const [replay, setReplay] = useState<ReplayPayload | null>(null)
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setError('Invalid replay id')
            setIsLoading(false)
            return
        }

        const fetchReplay = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await fetch(`${API_URL}/replays/${id}`)
                if (!response.ok) {
                    throw new Error('Replay not found')
                }

                const payload = await response.json() as ReplayPayload
                setReplay(payload)
                setCurrentTurnIndex(0)
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Failed to load replay'
                setError(message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchReplay()
    }, [id])

    const replayGame = useMemo(() => {
        if (!replay) {
            return null
        }

        const players: PlayerObject[] = replay.players.map((player) => ({
            name: player.name,
            score: 0,
            color: player.color,
            isHost: player.isHost,
        }))

        const currentTurn = replay.game[currentTurnIndex]
        if (!currentTurn) {
            return {
                id: replay.sessionId,
                players,
                board: { cells: [] },
            } as GameObject
        }

        const playerByName = new Map(players.map((player) => [player.name, player]))

        const mappedBoard = currentTurn.boardState.map((row) => row.map((cell) => mapReplayCell(cell, playerByName)))

        return {
            id: replay.sessionId,
            players,
            board: {
                cells: mappedBoard,
            },
        } as GameObject
    }, [replay, currentTurnIndex])

    const totalTurns = replay?.game.length || 0
    const canGoPrevious = currentTurnIndex > 0
    const canGoNext = currentTurnIndex < totalTurns - 1
    const activePlayerName = replay?.game[currentTurnIndex]?.playerName || null

    if (isLoading) {
        return <div>Loading replay...</div>
    }

    if (error || !replayGame) {
        return <div>{error || 'Replay unavailable'}</div>
    }

    return (
        <div className="replay-game">
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                Turn {totalTurns === 0 ? 0 : currentTurnIndex + 1} / {totalTurns}
            </div>
            <GameView
                currentGame={replayGame}
                activePlayerName={activePlayerName}
                currentCard={null}
                winningLine={null}
                currentPlayerName=""
                placeCard={noopPlaceCard}
                leftBoardControl={(
                    <button
                        type="button"
                        onClick={() => setCurrentTurnIndex((previous) => Math.max(previous - 1, 0))}
                        disabled={!canGoPrevious}
                        aria-label="Previous turn"
                    >
                        {'<'}
                    </button>
                )}
                rightBoardControl={(
                    <button
                        type="button"
                        onClick={() => setCurrentTurnIndex((previous) => Math.min(previous + 1, totalTurns - 1))}
                        disabled={!canGoNext}
                        aria-label="Next turn"
                    >
                        {'>'}
                    </button>
                )}
            />
        </div>
    )
}

function mapReplayCell(
    cell: { type: string; value?: string; color?: string; owner?: string },
    playerByName: Map<string, PlayerObject>,
): BoardCellObject {
    if (cell.type === 'placableSpot') {
        return { type: 'placableSpot' }
    }

    if (cell.type === 'unplacableSpot') {
        return { type: 'unplacableSpot' }
    }

    const fallbackOwner: PlayerObject = {
        name: cell.owner || 'unknown',
        score: 0,
        color: [cell.color || ''],
        isHost: false,
    }

    const owner = cell.owner ? (playerByName.get(cell.owner) || fallbackOwner) : fallbackOwner

    if (cell.type === 'placableCard') {
        return {
            type: 'placableCard',
            value: cell.value || '',
            color: cell.color || '',
            owner,
            isPlacable: true,
        }
    }

    return {
        type: 'card',
        value: cell.value || '',
        color: cell.color || '',
        owner,
        isPlacable: false,
    } as CardObject
}

const noopPlaceCard = (_placement: PlacementObject) => {
    return
}

export default ReplayGame
