import './Game.scss'
import Player from './Player'
import Board from './Board'

function Game() {
    const players = [
        {
            name: 'aaaaaaaa',
            color: 'blue',
            vertical: false,
            active: true,
            point1: true,
            point2: false
        },
        {
            name: 'bbbbbbbb',
            color: 'red',
            vertical: true,
            active: false,
            point1: false,
            point2: false
        },
        {
            name: 'wwwwwwww',
            color: 'green',
            vertical: true,
            active: false,
            point1: false,
            point2: false
        },
        {
            name: 'rrrrrrrr',
            color: 'orange',
            vertical: false,
            active: false,
            point1: false,
            point2: false
        }
    ]

    return (
        <div className="game-container">
            <div className="top">
                <Player key={players[0].name} name={players[0].name} color={players[0].color} vertical={players[0].vertical} active={players[0].active} point1={players[0].point1} point2={players[0].point2} currentCard='8' />
            </div>
            <div className="center">
                <Player key={players[1].name} name={players[1].name} color={players[1].color} vertical={players[1].vertical} active={players[1].active} point1={players[1].point1} point2={players[1].point2} currentCard='8' />
                <Board></Board>
                <Player key={players[2].name} name={players[2].name} color={players[2].color} vertical={players[2].vertical} active={players[2].active} point1={players[2].point1} point2={players[2].point2} currentCard='8' />
            </div>
            <div className="bottom">
                <Player key={players[3].name} name={players[3].name} color={players[3].color} vertical={players[3].vertical} active={players[3].active} point1={players[3].point1} point2={players[3].point2} currentCard='8' />
            </div>
        </div>
    )
}

export default Game