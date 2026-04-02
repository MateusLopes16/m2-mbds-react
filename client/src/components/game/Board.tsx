import './Board.scss'
import { useState } from 'react'
import Card from './Card'
import PlacableSpot from './PlacableSpot'
import UnPlacableSpot from './UnplacableSpot'
import type { PlacementObject, BoardObject, CardObject, BoardCellObject } from '../../service/WebSocketObjects'

function Board() {
    // @TODO: remove hardcoded current player color and get it from websocket
    const currentPlayerColor = 'blue';
    // @TODO: remove hardcoded current placing card and get it from websocket
    const [currentPlacingCard, setCurrentPlacingCard] = useState<CardObject | null>({ value: '8', owner: { name: 'Player1', score: 0, color: 'blue', isHost: true } });
    const [boardState, setBoardState] = useState<BoardCellObject[][]>(() =>
        Array.from({ length: 6 }, () =>
            Array.from({ length: 6 }, () => ({ type: 'unplacable' as const }))
        )
    );

    // @TODO: call this method when recieving new board state from websocket
    const refreshBoardState = (BoardObject: BoardObject) => {
        const { cells } = BoardObject;
        setBoardState(cells);
    };

    // const simulateBoardState = () => {
    //     const simulatedBoard: BoardCellObject[][] = Array.from({ length: 6 }, () =>
    //         Array.from({ length: 6 }, () => ({ type: 'unplacable' as const }))
    //     );
    //     simulatedBoard[2][3] = {
    //         type: 'card',
    //         card: {
    //             value: '5',
    //             owner: {
    //                 name: 'Player1',
    //                 score: 0,
    //                 color: 'red',
    //                 isHost: true
    //             }
    //         }
    //     };
    //     refreshBoardState({ cells: simulatedBoard });
    // };

    const updateCell = (x: number, y: number, value: BoardCellObject) => {
        if (x < 0 || x >= 6 || y < 0 || y >= 6) return;

        setBoardState((previousBoard) => {
            const nextBoard = previousBoard.map((row) => [...row]);
            nextBoard[y][x] = value;
            return nextBoard;
        });
    };

    // @TODO: this method should send a message to the server with the new placement 
    // Might need to change this method and verify if it's working proper
    const placeCard = (placement: PlacementObject) => {
        const { card, position } = placement;
        const { value, owner } = card;
        const { x, y } = position;

        updateCell(x, y, {
            type: 'card',
            card: {
                value: value,
                owner: {
                    name: owner.name,
                    score: owner.score,
                    color: owner.color,
                    isHost: owner.isHost,
                },
            },
        });
    };
    
    const isCardClickable = (card: BoardCellObject) => {
        if (!currentPlacingCard) return false;
        if (card.type !== 'card') return false;
        return currentPlacingCard && card.card.owner.color !== currentPlayerColor && card.card.value < currentPlacingCard.value;
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
            {boardState.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {row.map((cell, cellIndex) => (
                        // @TODO: add onClick handler to placable cells and send the position of the cell to the server
                        <div key={cellIndex} className="board-cell" data-pos={`${cellIndex},${rowIndex}`} {...(isCardClickable(cell) ? { onClick: handleClick } : {})}>
                            {cell.type === 'card' && <Card card={{ number: cell.card.value, cardColor: cell.card.owner.color, clickable: isCardClickable(cell) || false, playerColor: currentPlayerColor }} />}
                            {cell.type === 'placable' && <PlacableSpot color={currentPlayerColor} />}
                            {cell.type === 'unplacable' && <UnPlacableSpot />}
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