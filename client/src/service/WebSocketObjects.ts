export interface GameObject {
    id: string;
    players: PlayerObject[];
}

export interface PlayerObject {
    name: string;
    score: number;
    color: string;
    isHost: boolean;
}

export interface CardObject {
    value: string;
    owner: PlayerObject;
}

export interface PlacementObject {
    card: CardObject;
    position: { x: number; y: number };
}

export interface RoomConnectionObject {
    id: string;
    player: PlayerObject;
}

export interface BoardObject {
    cells: BoardCellObject[][];
}

export type BoardCellObject = {
    type: 'unplacable';
} | {
    type: 'placable';
} | {
    type: 'card';
    card: CardObject;
};