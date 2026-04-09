import './Waiting.scss'
import PlayerCard from './PlayerCard'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useWebSocket } from '../../service/WebSocket'

function Waiting() {
    const { id: routeGameId } = useParams()
    const { currentGame, currentPlayerName, leaveRoom, disconnectFromWebSocket, startGame } = useWebSocket()
    const navigate = useNavigate()
    const location = useLocation()
    const [copySuccess, setCopySuccess] = useState(false)
    const copyTimeoutRef = useRef<number | null>(null)

    const gameId = currentGame?.id ?? routeGameId ?? '------'
    const players = (currentGame?.players ?? []).map((player) => ({
        name: player.name,
        isHost: player.isHost,
        isMe: player.name === currentPlayerName,
    }))
    const currentPlayer = currentGame?.players.find((player) => player.name === currentPlayerName)
    const canLaunchGame = currentPlayer?.isHost && players.length >= 2
    const isInLobby = location.pathname.startsWith('/lobby/')
    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                window.clearTimeout(copyTimeoutRef.current)
            }
        }
    }, [])

    const handleCopyGameCode = async () => {
        if (!gameId || gameId === '------') {
            return
        }

        try {
            await navigator.clipboard.writeText(gameId)
            setCopySuccess(true)
            if (copyTimeoutRef.current) {
                window.clearTimeout(copyTimeoutRef.current)
            }
            
            copyTimeoutRef.current = window.setTimeout(() => {
                setCopySuccess(false)
            }, 1800)
        } catch (error) {
            console.error('Impossible de copier le code de la partie', error)
        }
    }

    const handleLaunchGame = () => {
        startGame(gameId)
    }

    const handleBackClick = async () => {
        if (isInLobby) {
            const { isConfirmed } = await Swal.fire({
                title: 'Quitter la partie ?',
                text: 'Si vous retournez en arriere, vous quitterez ce lobby.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Quitter',
                cancelButtonText: 'Rester',
                reverseButtons: true,
                customClass: {
                    popup: 'app-swal-popup',
                    title: 'app-swal-title',
                    htmlContainer: 'app-swal-text',
                    confirmButton: 'app-swal-confirm',
                    cancelButton: 'app-swal-cancel',
                },
                buttonsStyling: false,
            })

            if (!isConfirmed) {
                return
            }

            leaveRoom(gameId)
            disconnectFromWebSocket()
            navigate('/', { replace: true })
            return
        }

        navigate(-1)
    }

    return (
        <div className="waiting">
            <div className="card">
                <div className="header">
                    <div className="top">
                        <button className="back" type="button" onClick={handleBackClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                            <div className="text">Retour</div>
                        </button>
                        <div className="player-count">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
                            <div className="text">{players.length}/4</div>
                        </div>
                    </div>
                    <div className="title">
                        En attente de joueurs
                    </div>
                    <div className="game-info">
                        <div className="game-id">GAME ID</div>
                        <div className="game-code">
                            <div className="text">{gameId}</div>
                            <svg id="copy-game-code" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" onClick={handleCopyGameCode}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                        </div>
                        <div className={`copy-feedback ${copySuccess ? 'visible' : ''}`}>Code copier dans le presse papier</div>
                    </div>
                </div>
                <div className="content">
                    <div className="list-title">JOUEURS DANS LA PARTIE</div>
                    <div className="list">
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const player = players[idx]
                            return player ? (
                                <PlayerCard key={player.name} player={{ name: player.name, isHost: player.isHost, isMe: player.isMe }} />
                            ) : (
                                <PlayerCard key={`empty-${idx}`} player={{ name: 'En attente...', isHost: false, isMe: false }} />
                            )
                        })}

                    </div>
                    <div className="loader">En attente de joueurs</div>
                </div>
                <div className="footer">
                    <button className="launch-game full-button" disabled={!canLaunchGame} onClick={handleLaunchGame}>Lancer la partie</button>
                </div>
            </div>
        </div>
    )

}

export default Waiting;