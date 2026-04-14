import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import GameView from './GameView'
import Swal from 'sweetalert2'
import type { BoardCellObject, BoardPositionObject, CardObject, GameObject, PlacementObject, PlayerObject } from '../../service/WebSocketObjects'
import './ReplayGame.scss'
import GameReplayActions from './replay/GameReplayActions'

type ReplayTurn = {
    turn?: number;
    playerName?: string;
    playedCard?: {
        value?: string;
        color?: string;
    };
    position?: {
        x: number;
        y: number;
    };
    playerScores?: Array<{
        name: string;
        score: number;
    }>;
    scoringPlayerName?: string | null;
    winningLine?: Array<{
        x: number;
        y: number;
    }> | null;
    boardState: Array<Array<{
        type: string;
        value?: string;
        color?: string;
        owner?: string;
        isPlacable?: boolean;
    }>>;
}

type ReplayBoardCell = {
    type: string;
    value?: string;
    color?: string;
    owner?: string;
    isPlacable?: boolean;
}

type ReplayPayload = {
    sessionId: string;
    players: Array<{
        name: string;
        isHost: boolean;
        color: string[];
        score?: number;
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
    const [isPlaybackBlocked, setIsPlaybackBlocked] = useState(false)
    const previousTurnIndexRef = useRef(0)

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

    const currentTurn = replay?.game[currentTurnIndex]
    const nextTurn = replay?.game[currentTurnIndex + 1]

    const scoreByName = useMemo(() => {
        const map = new Map<string, number>()
        replay?.players.forEach((player) => {
            map.set(player.name, player.score ?? 0)
        })

        if (!replay || !currentTurn) {
            return map
        }

        for (let index = 0; index <= currentTurnIndex; index += 1) {
            const turn = replay.game[index]
            if (!turn) {
                continue
            }

            if (turn.playerScores?.length) {
                turn.playerScores.forEach((playerScore) => {
                    map.set(playerScore.name, playerScore.score)
                })
                continue
            }

            const scoringPlayerName =
                turn.scoringPlayerName ||
                detectScoringPlayerName(replay.game[index - 1], turn) ||
                detectScoringPlayerNameFromWinningAlignment(turn)

            if (scoringPlayerName) {
                map.set(scoringPlayerName, (map.get(scoringPlayerName) ?? 0) + 1)
            }
        }

        return map
    }, [replay, currentTurn, currentTurnIndex])

    const replayGame = useMemo(() => {
        if (!replay) {
            return null
        }

        const players: PlayerObject[] = replay.players.map((player) => ({
            name: player.name,
            score: scoreByName.get(player.name) ?? player.score ?? 0,
            color: player.color,
            isHost: player.isHost,
        }))

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
    }, [replay, currentTurn, scoreByName])

    const replayCurrentCard = useMemo(() => {
        if (!replayGame || !nextTurn?.playedCard || !nextTurn.playerName) {
            return null
        }

        const owner = replayGame.players.find((player) => player.name === nextTurn.playerName)
        if (!owner) {
            return null
        }

        return {
            type: 'card',
            value: nextTurn.playedCard.value || '',
            color: nextTurn.playedCard.color || '',
            owner,
            isPlacable: false,
        } as CardObject
    }, [nextTurn, replayGame])

    const replayWinningLine = useMemo(() => {
        if (!currentTurn?.winningLine?.length) {
            if (!currentTurn?.boardState?.length) {
                return null
            }

            return detectWinningLineFromBoard(currentTurn.boardState, currentTurn.playedCard?.color)
        }

        return currentTurn.winningLine.map((position) => ({ x: position.x, y: position.y })) as BoardPositionObject[]
    }, [currentTurn])

    const replayPlacedPosition = useMemo(() => {
        if (!currentTurn?.position) {
            return null
        }

        return { x: currentTurn.position.x, y: currentTurn.position.y } as BoardPositionObject
    }, [currentTurn])

    useEffect(() => {
        if (!replay || !currentTurn) {
            return
        }

        const previousTurnIndex = previousTurnIndexRef.current
        previousTurnIndexRef.current = currentTurnIndex

        if (currentTurnIndex <= previousTurnIndex) {
            return
        }

        const scoringPlayerName =
            currentTurn.scoringPlayerName ||
            detectScoringPlayerName(replay.game[currentTurnIndex - 1], currentTurn) ||
            detectScoringPlayerNameFromWinningAlignment(currentTurn)
        if (!scoringPlayerName) {
            return
        }

        const scorerScore = scoreByName.get(scoringPlayerName)

        const showScorePopup = async () => {
            try {
                setIsPlaybackBlocked(true)
                await Swal.fire({
                    icon: 'success',
                    title: `${scoringPlayerName} marque un point !`,
                    text: scorerScore ? `Score: ${scorerScore}` : undefined,
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'app-swal-popup',
                        title: 'app-swal-title',
                        htmlContainer: 'app-swal-text',
                        confirmButton: 'app-swal-confirm',
                        cancelButton: 'app-swal-cancel',
                    },
                })
            } finally {
                setIsPlaybackBlocked(false)
            }
        }

        void showScorePopup()
    }, [replay, currentTurn, currentTurnIndex, scoreByName])

    const totalTurns = replay?.game.length || 0
    const canGoPrevious = currentTurnIndex > 0
    const canGoNext = currentTurnIndex < totalTurns - 1
    const activePlayerName = nextTurn?.playerName || null

    const goToPreviousTurn = useCallback(() => {
        setCurrentTurnIndex((previous) => Math.max(previous - 1, 0))
    }, [])

    const goToNextTurn = useCallback(() => {
        setCurrentTurnIndex((previous) => Math.min(previous + 1, Math.max(totalTurns - 1, 0)))
    }, [totalTurns])

    const goToTurn = useCallback((turnIndex: number) => {
        setCurrentTurnIndex(Math.min(Math.max(turnIndex, 0), Math.max(totalTurns - 1, 0)))
    }, [totalTurns])

    if (isLoading) {
        return <div>Loading replay...</div>
    }

    if (error || !replayGame) {
        return <div>{error || 'Replay unavailable'}</div>
    }

    return (
        <div className="replay-game">
            <GameView
                currentGame={replayGame}
                activePlayerName={activePlayerName}
                currentCard={replayCurrentCard}
                winningLine={replayWinningLine}
                lastPlacedPosition={replayPlacedPosition}
                currentPlayerName=""
                placeCard={noopPlaceCard}
            />
            <GameReplayActions
                currentTurnIndex={currentTurnIndex}
                totalTurns={totalTurns}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                isPlaybackBlocked={isPlaybackBlocked}
                onPrevious={goToPreviousTurn}
                onNext={goToNextTurn}
                onSeek={goToTurn}
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

function detectScoringPlayerName(previousTurn: ReplayTurn | undefined, currentTurn: ReplayTurn): string | null {
    const currentScores = currentTurn.playerScores
    if (!currentScores?.length) {
        return null
    }

    const previousScoreByName = new Map<string, number>()
    previousTurn?.playerScores?.forEach((player) => {
        previousScoreByName.set(player.name, player.score)
    })

    const scorer = currentScores.find((player) => player.score > (previousScoreByName.get(player.name) ?? 0))
    return scorer?.name || null
}

function detectScoringPlayerNameFromWinningAlignment(turn: ReplayTurn): string | null {
    if (!turn.playerName || !turn.boardState?.length) {
        return null
    }

    const hasWinningLine = !!detectWinningLineFromBoard(turn.boardState, turn.playedCard?.color)
    return hasWinningLine ? turn.playerName : null
}

function detectWinningLineFromBoard(boardState: ReplayBoardCell[][], preferredColor?: string): BoardPositionObject[] | null {
    const boardSize = boardState.length
    const winLength = 4
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ]

    const colorsToCheck = preferredColor
        ? [preferredColor]
        : Array.from(new Set(boardState.flat().map((cell) => cell.color).filter((color): color is string => !!color)))

    for (const color of colorsToCheck) {
        for (let row = 0; row < boardSize; row += 1) {
            for (let col = 0; col < boardState[row].length; col += 1) {
                for (const [dRow, dCol] of directions) {
                    const endRow = row + (winLength - 1) * dRow
                    const endCol = col + (winLength - 1) * dCol

                    if (endRow < 0 || endRow >= boardSize || endCol < 0 || endCol >= boardState[row].length) {
                        continue
                    }

                    let aligned = true
                    const line: BoardPositionObject[] = []
                    for (let step = 0; step < winLength; step += 1) {
                        const currentRow = row + step * dRow
                        const currentCol = col + step * dCol
                        const cell = boardState[currentRow][currentCol]
                        const isCard = cell.type === 'card' || cell.type === 'placableCard'

                        if (!isCard || cell.color !== color) {
                            aligned = false
                            break
                        }

                        line.push({ x: currentRow, y: currentCol })
                    }

                    if (aligned) {
                        return line
                    }
                }
            }
        }
    }

    return null
}

const noopPlaceCard = (_placement: PlacementObject) => {
    return
}

export default ReplayGame
