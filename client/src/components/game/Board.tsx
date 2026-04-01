import './Board.scss'
import Card from './Card'
import PlacableSpot from './Placablespot'
import UnPlacableSpot from './UnPlacableSpot'

function Board() {
    return (
        <div className="board-container">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div className="board-row" key={rowIndex}>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                        <div className="board-cell" key={colIndex}>
                            {/* <Card card={{ number: '5', playerColor: 'red', clickable: true, cardColor: 'blue' }} /> */}
                            {/* <PlacableSpot color={colIndex % 2 === 0 ? 'blue' : 'red'} /> */}
                            {/* <UnPlacableSpot /> */}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Board