import './Board.scss'
import Card from './Card'
import PlacableSpot from './PlacableSpot'
import UnPlacableSpot from './UnplacableSpot'
import type { BoardObject, BoardCellObject, BoardPositionObject } from '../../../service/WebSocketObjects'

function Board({ board, currentCardColor, isCurrentPlayerTurn, winningLine, lastPlacedPosition, onCellClick }: { board: BoardObject; currentCardColor: string; isCurrentPlayerTurn: boolean; winningLine: BoardPositionObject[] | null; lastPlacedPosition: BoardPositionObject | null; onCellClick: (x: number, y: number) => void }) {
    const isCardClickable = (cell: BoardCellObject): boolean => {
        return isCurrentPlayerTurn && (cell.type === 'placableSpot' || cell.type === 'placableCard');
    };

    const isWinningCell = (x: number, y: number): boolean => {
        return !!winningLine?.some((position) => position.x === x && position.y === y);
    };

    const isLastPlacedCell = (x: number, y: number): boolean => {
        if (!lastPlacedPosition) {
            return false;
        }

        return lastPlacedPosition.x === x && lastPlacedPosition.y === y;
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.currentTarget as HTMLDivElement;
        const pos = target.getAttribute('data-pos');
        if (!pos) return;
        const [x, y] = pos.split(',').map(Number);
        onCellClick(x, y);
    };

    return (
        <div className="board-container">
            {board.cells.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {row.map((cell, cellIndex) => (
                        <div key={cellIndex} className={`board-cell ${isWinningCell(rowIndex, cellIndex) ? 'scale-and-pulse' : ''}`} data-pos={`${rowIndex},${cellIndex}`} {...(isCardClickable(cell) ? { onClick: handleClick } : {})}>
                            {cell.type === 'placableCard' && (
                                <div className={`board-card-wrapper ${isLastPlacedCell(rowIndex, cellIndex) ? 'card-place-pop' : ''}`}>
                                    {isCurrentPlayerTurn ? <Card card={{ number: cell.value, cardColor: cell.color, clickable: true, playerColor: currentCardColor }} /> : <Card card={{ number: cell.value, cardColor: cell.color, clickable: false, playerColor: '' }} />}
                                </div>
                            )}
                            {cell.type === 'card' && (
                                <div className={`board-card-wrapper ${isLastPlacedCell(rowIndex, cellIndex) ? 'card-place-pop' : ''}`}>
                                    <Card card={{ number: cell.value, cardColor: cell.color, clickable: false, playerColor: '' }} />
                                </div>
                            )}
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