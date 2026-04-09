import './Player.scss'

function Player(player: { name: string, color: string | string[], vertical: boolean, active: boolean, point1: boolean, point2: boolean, currentCard?: string, activeCardColor?: string, isPlayingActive?: boolean }) {
    const colors = Array.isArray(player.color) ? player.color : [player.color];
    const primaryColor = colors[0];
    const displayColor = player.active && player.activeCardColor ? player.activeCardColor : primaryColor;
    
    // Show gray card if someone is playing but this player isn't active, otherwise show actual card
    const cardDisplayColor = player.active ? displayColor : (player.isPlayingActive ? 'gray' : 'gray');

    return (
        <div className={`player-container ${displayColor} ${player.vertical ? 'vertical' : 'horizontal'} ${player.active ? 'active' : ''}`}>
            <div className="color-indicators">
                {colors.map((color, index) => (
                    <div key={index} className={`color-indicator ${color}`}></div>
                ))}
            </div>
            <div className="player-name">{player.name}</div>
            <div className={`score ${player.vertical ? 'vertical' : 'horizontal'}`}>
                <div className={`point1 ${player.point1 ? 'active' : ''} ${displayColor}`}>
                    {player.point1 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>)
                        : null}
                </div>
                <div className={`point2 ${player.point2 ? 'active' : ''} ${displayColor}`}>
                    {player.point2 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>)
                        : null}
                </div>
            </div>
            <div className={`current-card ${cardDisplayColor}`}>
                <span className="value">{player.active ? player.currentCard : ''}</span>
            </div>
        </div>
    )
}

export default Player