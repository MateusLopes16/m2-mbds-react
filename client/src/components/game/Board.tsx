import './Board.scss'

function Board() {
    return (
        <div className="board-container">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div className="board-row" key={rowIndex}>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                        <div className="board-cell" key={colIndex}>
                            {/* Contenu de la cellule */}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Board