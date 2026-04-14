import { useWebSocket } from '../../service/WebSocket'
import GameView from './GameView'

function Game() {
    const { currentGame, activePlayerName, currentCard, winningLine, lastPlacedPosition, currentPlayerName, placeCard } = useWebSocket()

    return (
        <GameView
            currentGame={currentGame}
            activePlayerName={activePlayerName}
            currentCard={currentCard}
            winningLine={winningLine}
            lastPlacedPosition={lastPlacedPosition}
            currentPlayerName={currentPlayerName}
            placeCard={placeCard}
        />
    )
}

export default Game