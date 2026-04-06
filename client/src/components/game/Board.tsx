import './Board.scss'
import Card from './Card'
import PlacableSpot from './PlacableSpot'
import UnPlacableSpot from './UnplacableSpot'
import type { BoardObject, BoardCellObject } from '../../service/WebSocketObjects'

function Board({ board, currentCardColor, isCurrentPlayerTurn, onCellClick }: { board: BoardObject; currentCardColor: string; isCurrentPlayerTurn: boolean; onCellClick: (x: number, y: number) => void }) {
    const isCardClickable = (cell: BoardCellObject): boolean => {
        return isCurrentPlayerTurn && (cell.type === 'placableSpot' || cell.type === 'placableCard');
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.currentTarget as HTMLDivElement;
        const pos = target.getAttribute('data-pos');
        if (!pos) return;
        const [x, y] = pos.split(',').map(Number);
        console.log(`Cell clicked at position: (${x}, ${y})`);
        onCellClick(x, y);
    };

    return (
        <div className="board-container">
            {board.cells.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {row.map((cell, cellIndex) => (
                        // @TODO: add onClick handler to placable cells and send the position of the cell to the server
                        <div key={cellIndex} className="board-cell" data-pos={`${rowIndex},${cellIndex}`} {...(isCardClickable(cell) ? { onClick: handleClick } : {})}>
                            {cell.type === 'placableCard' && (isCurrentPlayerTurn ? <Card card={{ number: cell.value, cardColor: cell.color, clickable: true, playerColor: currentCardColor }} /> : <Card card={{ number: cell.value, cardColor: cell.color, clickable: false, playerColor: '' }} />)}
                            {cell.type === 'card' && <Card card={{ number: cell.value, cardColor: cell.color, clickable: false, playerColor: '' }} />}
                            {cell.type === 'placableSpot' && (isCurrentPlayerTurn ? <PlacableSpot color={currentCardColor} /> : <UnPlacableSpot />)}
                            {cell.type === 'unplacableSpot' && <UnPlacableSpot />}
                        </div>
                    ))}
                </div>
            ))}
        </div>

    )
}

export default Board