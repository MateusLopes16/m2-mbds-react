export interface Game {
    id: string;
    players: Player[];
}

export interface Player {
    name: string;
    score: number;
    color: string;
    isHost: boolean;
}

export interface Card {
    value: string;
    color: string;
    owner: Player;
}

export interface Placement {
    card: Card;
    position: { x: number; y: number };
}

export interface RoomConnection {
    id: string;
    player: Player;
}