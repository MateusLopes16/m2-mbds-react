import { useWebSocket } from '../../service/WebSocket'
import GameView from './GameView'

function Game() {
    const { currentGame, activePlayerName, currentCard, currentPlayerName, placeCard } = useWebSocket()

    return (
        <GameView
            currentGame={currentGame}
            activePlayerName={activePlayerName}
            currentCard={currentCard}
            currentPlayerName={currentPlayerName}
            placeCard={placeCard}
        />
    )
}

export default Game