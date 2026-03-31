import './Player.scss'

function Player(player: { name: string, color: string, vertical: boolean, active: boolean, point1?: boolean, point2?: boolean, currentCard?: string }) {
    return (
        <div className={`player-container ${player.color} ${player.vertical ? 'vertical' : 'horizontal'} ${player.active ? 'active' : ''}`}>
            <div className={`color-indicator ${player.color}`}></div>
            <div className="player-name">{player.name}</div>
            <div className={`score ${player.vertical ? 'vertical' : 'horizontal'}`}>
                <div className={`point1 ${player.point1 ? 'active' : ''} ${player.color}`}>
                    {player.point1 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>)
                        : null}
                </div>
                <div className={`point2 ${player.point2 ? 'active' : ''} ${player.color}`}>
                    {player.point2 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>)
                        : null}
                </div>
            </div>
            <div className={`current-card ${player.color}`}>
                <span className="value">{player.currentCard}</span>
            </div>
        </div>
    )
}

export default Player