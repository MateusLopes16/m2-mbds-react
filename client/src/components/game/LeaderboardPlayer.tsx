import './LeaderboardPlayer.scss';
import type { PlayerObject } from '../../service/WebSocketObjects';

function LeaderboardPlayer({ player, index, isWinner }: { player: PlayerObject; index: number; isWinner: boolean }) {
    return (
        <div className="leaderboard-player">
            <span className={`placement ${isWinner ? 'first' : ''} ${player.color[0]}`}>
                {index === 0 ?
                    <svg className="placement-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path><path d="M5 21h14"></path></svg>
                    :
                    <div className="placement-number">{index + 1}</div>
                }
            </span >
            <div className="color-indicators">
                {player.color.map((c, index) => (
                    <div key={index} className={`color-indicator ${c}`}></div>
                ))}
            </div>
            <span className="player-name">{player.name}</span>
            <div className="score">
                <div className={`point1 ${player.score >= 1 ? 'active' : ''} ${player.color[0]}`}>
                    {player.score >= 1 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>)
                        : null}
                </div>
                <div className={`point2 ${player.score >= 2 ? 'active' : ''} ${player.color[0]}`}>
                    {player.score >= 2 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>)
                        : null}
                </div>
            </div>
        </div >
    );
}

export default LeaderboardPlayer;