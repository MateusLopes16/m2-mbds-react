import './Board.scss'
import Card from './Card'
import PlacableSpot from './PlacableSpot'
import UnPlacableSpot from './UnplacableSpot'
import type { BoardObject, BoardCellObject } from '../../service/WebSocketObjects'

function Board({ board, currentCardColor, isCurrentPlayerTurn }: { board: BoardObject; currentCardColor: string; isCurrentPlayerTurn: boolean }) {
    const isCardClickable = (cell: BoardCellObject): boolean => {
        return isCurrentPlayerTurn && (cell.type === 'placableSpot' || cell.type === 'placableCard');
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.currentTarget as HTMLDivElement;
        const pos = target.getAttribute('data-pos');
        if (!pos) return;
        const [x, y] = pos.split(',').map(Number);
        console.log(`Cell clicked at position: (${x}, ${y})`);
    };

    return (
        <div className="board-container">
            {board.cells.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {row.map((cell, cellIndex) => (
                        // @TODO: add onClick handler to placable cells and send the position of the cell to the server
                        <div key={cellIndex} className="board-cell" data-pos={`${cellIndex},${rowIndex}`} {...(isCardClickable(cell) ? { onClick: handleClick } : {})}>
                            {cell.type === 'placableCard' && <Card card={{ number: cell.value, cardColor: cell.color, clickable: isCardClickable(cell) || false, playerColor: currentCardColor }} />}
                            {cell.type === 'card' && <Card card={{ number: cell.value, cardColor: cell.color, clickable: isCardClickable(cell) || false, playerColor: '' }} />}
                            {cell.type === 'placableSpot' && <PlacableSpot color={currentCardColor} />}
                            {cell.type === 'unplacableSpot' && <UnPlacableSpot />}
                        </div>
                    ))}
                </div>
            ))}
            {/* <button onClick={() => placeCard({ card: { value: '5', owner: { name: 'Player1', score: 0, color: 'red', isHost: true } }, position: { x: 2, y: 3 } })}>Place Card</button>
            <button onClick={() => setCurrentPlacingCard(null)}>Set Placing Card to null</button> */}
        </div>

    )
}

export default Board