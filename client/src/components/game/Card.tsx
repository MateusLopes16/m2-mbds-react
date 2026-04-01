import './Card.scss';

function Card({ card }: { card: { number: string, cardColor: string, clickable: boolean, playerColor: string } }) {
    return (
        <div className={`card ${card.cardColor} ${card.clickable ? 'clickable' : ''}`}>
            <div className="card-number">{card.number}</div>
            <div className={`indicator ${card.playerColor} ${card.clickable ? 'clickable' : 'unclickable'}`}>!</div>
        </div>
    );
}

export default Card;
