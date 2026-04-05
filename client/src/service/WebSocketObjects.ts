export interface GameObject {
    id: string;
    players: PlayerObject[];
    board: BoardObject;
}

export interface PlayerObject {
    name: string;
    score: number;
    color: string[];
    isHost: boolean;
}

export interface CardObject {
    type: 'card';
    value: string;
    owner: PlayerObject;
    color: string;
    isPlacable: false;
}

export interface PlacementObject {
    card: CardObject;
    position: { x: number; y: number };
}

export interface RoomConnectionObject {
    id: string;
    player: PlayerObject;
}

export interface PlacableCardObject {
    type: 'placableCard';
    value: string;
    owner: PlayerObject;
    isPlacable: true;
    color: string;
}

export interface PlacableSpotObject {
    type: 'placableSpot';
}

export interface UnplacableSpotObject {
    type: 'unplacableSpot';
}

export type BoardCellObject = CardObject | PlacableCardObject | PlacableSpotObject | UnplacableSpotObject;

export interface BoardObject {
    cells: BoardCellObject[][];
}

export interface TurnObject {
    card: CardObject;
    game: GameObject;
}