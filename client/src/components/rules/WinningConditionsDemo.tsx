import { useEffect, useMemo, useState } from 'react';
import Card from '../game/board/Card';
import UnPlacableSpot from '../game/board/UnplacableSpot';
import './WinningConditionsDemo.scss';

type CardColor = 'blue' | 'red' | 'green' | 'orange';

type BoardCell =
    | { type: 'blocked' }
    | { type: 'card'; number: string; cardColor: CardColor; isWinning?: boolean };

type Condition = {
    title: string;
    board: BoardCell[][];
};

const conditions: Condition[] = [
    {
        title: 'Alignement horizontal',
        board: [
            [
                { type: 'card', number: '2', cardColor: 'orange' },
                { type: 'blocked' },
                { type: 'card', number: '8', cardColor: 'green' },
                { type: 'blocked' }
            ],
            [
                { type: 'card', number: '1', cardColor: 'red', isWinning: true },
                { type: 'card', number: '4', cardColor: 'red', isWinning: true },
                { type: 'card', number: '6', cardColor: 'red', isWinning: true },
                { type: 'card', number: '9', cardColor: 'red', isWinning: true }
            ],
            [
                { type: 'blocked' },
                { type: 'card', number: '3', cardColor: 'blue' },
                { type: 'card', number: '5', cardColor: 'orange' },
                { type: 'card', number: '7', cardColor: 'green' }
            ],
            [
                { type: 'card', number: '2', cardColor: 'blue' },
                { type: 'blocked' },
                { type: 'card', number: '6', cardColor: 'orange' },
                { type: 'card', number: '1', cardColor: 'green' }
            ]
        ]
    },
    {
        title: 'Alignement vertical',
        board: [
            [
                { type: 'blocked' },
                { type: 'card', number: '7', cardColor: 'blue', isWinning: true },
                { type: 'card', number: '2', cardColor: 'red' },
                { type: 'blocked' }
            ],
            [
                { type: 'card', number: '3', cardColor: 'orange' },
                { type: 'card', number: '8', cardColor: 'blue', isWinning: true },
                { type: 'blocked' },
                { type: 'card', number: '6', cardColor: 'green' }
            ],
            [
                { type: 'blocked' },
                { type: 'card', number: '5', cardColor: 'blue', isWinning: true },
                { type: 'card', number: '9', cardColor: 'orange' },
                { type: 'card', number: '1', cardColor: 'red' }
            ],
            [
                { type: 'card', number: '4', cardColor: 'green' },
                { type: 'card', number: '9', cardColor: 'blue', isWinning: true },
                { type: 'blocked' },
                { type: 'card', number: '2', cardColor: 'orange' }
            ]
        ]
    },
    {
        title: 'Alignement diagonal (\\)',
        board: [
            [
                { type: 'card', number: '4', cardColor: 'green', isWinning: true },
                { type: 'blocked' },
                { type: 'card', number: '8', cardColor: 'blue' },
                { type: 'card', number: '1', cardColor: 'orange' }
            ],
            [
                { type: 'card', number: '3', cardColor: 'red' },
                { type: 'card', number: '6', cardColor: 'green', isWinning: true },
                { type: 'blocked' },
                { type: 'card', number: '2', cardColor: 'blue' }
            ],
            [
                { type: 'blocked' },
                { type: 'card', number: '5', cardColor: 'orange' },
                { type: 'card', number: '8', cardColor: 'green', isWinning: true },
                { type: 'blocked' }
            ],
            [
                { type: 'card', number: '9', cardColor: 'blue' },
                { type: 'blocked' },
                { type: 'card', number: '3', cardColor: 'red' },
                { type: 'card', number: '9', cardColor: 'green', isWinning: true }
            ]
        ]
    },
    {
        title: 'Alignement diagonal (/)',
        board: [
            [
                { type: 'blocked' },
                { type: 'card', number: '3', cardColor: 'orange' },
                { type: 'card', number: '1', cardColor: 'red' },
                { type: 'card', number: '6', cardColor: 'orange', isWinning: true }
            ],
            [
                { type: 'card', number: '8', cardColor: 'green' },
                { type: 'blocked' },
                { type: 'card', number: '7', cardColor: 'orange', isWinning: true },
                { type: 'card', number: '2', cardColor: 'blue' }
            ],
            [
                { type: 'card', number: '4', cardColor: 'blue' },
                { type: 'card', number: '9', cardColor: 'orange', isWinning: true },
                { type: 'blocked' },
                { type: 'card', number: '5', cardColor: 'green' }
            ],
            [
                { type: 'card', number: '1', cardColor: 'orange', isWinning: true },
                { type: 'card', number: '2', cardColor: 'red' },
                { type: 'blocked' },
                { type: 'card', number: '8', cardColor: 'blue' }
            ]
        ]
    }
];

function WinningConditionsDemo() {
    const [conditionIndex, setConditionIndex] = useState(0);
    const [pulseTick, setPulseTick] = useState(0);

    const currentCondition = useMemo(() => conditions[conditionIndex], [conditionIndex]);

    useEffect(() => {
        const pulseDuration = 1200;
        const timer = window.setInterval(() => {
            setPulseTick((value) => value + 1);
        }, pulseDuration);

        return () => window.clearInterval(timer);
    }, []);

    const handleNextCondition = () => {
        setConditionIndex((prev) => (prev + 1) % conditions.length);
    };

    return (
        <div className="winning-conditions-demo">
            <div className="demo-header">
                <span className="demo-title">{currentCondition.title}</span>
                <button type="button" className="next-condition" onClick={handleNextCondition} aria-label="Afficher la prochaine condition de victoire">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15.55-6.36L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15.55 6.36L3 16"></path></svg>
                    Suivant
                </button>
            </div>
            <div className="board-4x4">
                {currentCondition.board.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="board-row">
                        {row.map((cell, colIndex) => (
                            <div key={`cell-${rowIndex}-${colIndex}`} className="board-cell">
                                {cell.type === 'blocked' ? (
                                    <UnPlacableSpot />
                                ) : (
                                    <div
                                        key={cell.isWinning ? `winning-${pulseTick}-${rowIndex}-${colIndex}` : `card-${rowIndex}-${colIndex}`}
                                        className={cell.isWinning ? 'scale-and-pulse winning-card' : 'winning-card'}
                                    >
                                        <Card card={{ number: cell.number, cardColor: cell.cardColor, clickable: false, playerColor: '' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WinningConditionsDemo;
