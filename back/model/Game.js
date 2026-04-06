const BOARD_SIZE = 6;

/**
 * Creates an empty 6x6 board filled with unplacable spots
 * @returns {Array<Array<Object>>} 6x6 board with UnplacableSpot objects
 */
function createEmptyBoard() {
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = {
                type: 'unplacableSpot'
            };
        }
    }
    return board;
}

/**
 * Initializes a new game with players and board
 * @param {Array<Object>} players - Array of player objects
 * @returns {Object} Initialized game object with board and players
 */
function initGame(players) {
    // Give colors to players based on player count
    giveColorToPlayers(players);
    giveCardsToPlayers(players);

    players.shuffle = function () {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    };
    players.shuffle();

    // Create empty board with all unplacable spots
    const board = createEmptyBoard();

    return {
        players: players,
        board: {
            cells: board
        },
        currentPlayerIndex: 0
    };
}

/**
 * Gives colors to players following Punto game rules
 * 2 players: each gets 2 colors
 * 3 players: each gets 1 color, 1 color unassigned
 * 4 players: each gets 1 color
 * @param {Array<Object>} players - Array of player objects to assign colors to
 */
function giveColorToPlayers(players) {
    const colors = ['red', 'blue', 'green', 'orange'];

    // Shuffle colors
    for (let i = colors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colors[i], colors[j]] = [colors[j], colors[i]];
    }

    const numPlayers = players.length;

    if (numPlayers === 2) {
        // Each player receives 2 colors
        players[0].color = [colors[0], colors[1]];
        players[1].color = [colors[2], colors[3]];
    } else if (numPlayers === 3) {
        // Each player receives 1 color, last color unassigned
        players[0].color = [colors[0]];
        players[1].color = [colors[1]];
        players[2].color = [colors[2]];
        // colors[3] is unassigned
    } else if (numPlayers === 4) {
        // Each player receives 1 color
        players.forEach((player, index) => {
            player.color = [colors[index]];
        });
    }
}

function giveCardsToPlayers(players) {
    const colors = ['red', 'blue', 'green', 'orange'];
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const numPlayers = players.length;

    // Initialize empty cards array for all players
    players.forEach((player) => {
        player.cards = [];
    });

    if (numPlayers === 2) {
        // 2 players: each gets 2 cards of each value for each of their 2 colors
        players.forEach((player) => {
            player.color.forEach((color) => {
                values.forEach((value) => {
                    for (let i = 0; i < 2; i++) {
                        player.cards.push({
                            value: value,
                            color: color
                        });
                    }
                });
            });
        });
    } else if (numPlayers === 3) {
        // 3 players: each gets 2 of each value for their main color
        // Shared color (colors[3]) cards are shuffled among all players
        players.forEach((player) => {
            values.forEach((value) => {
                for (let i = 0; i < 2; i++) {
                    player.cards.push({
                        value: value,
                        color: player.color[0]
                    });
                }
            });
        });

        // Create shared color cards (2 of each value)
        const sharedColorCards = [];
        values.forEach((value) => {
            for (let i = 0; i < 2; i++) {
                sharedColorCards.push({
                    value: value,
                    color: colors[3]
                });
            }
        });

        // Shuffle shared color cards
        for (let i = sharedColorCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sharedColorCards[i], sharedColorCards[j]] = [sharedColorCards[j], sharedColorCards[i]];
        }

        // Distribute shuffled shared cards evenly among players
        sharedColorCards.forEach((card, index) => {
            players[index % numPlayers].cards.push(card);
        });

    } else if (numPlayers === 4) {
        // 4 players: each gets 2 cards of each value for their 1 color
        players.forEach((player) => {
            values.forEach((value) => {
                for (let i = 0; i < 2; i++) {
                    player.cards.push({
                        value: value,
                        color: player.color[0]
                    });
                }
            });
        });
    }
}

function playerTurn(game) {
    if (!game || !game.players || game.players.length === 0) {
        return;
    }

    // Move to next player
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

    const currentPlayer = game.players[game.currentPlayerIndex];

    // If player has no cards left, skip to next player
    if (!currentPlayer.cards || currentPlayer.cards.length === 0) {
        return playerTurn(game); // Recursively find next player with cards
    }

    const playingCard = currentPlayer.cards[Math.floor(Math.random() * currentPlayer.cards.length)];
    const card = {
        type: 'card',
        value: playingCard.value,
        owner: currentPlayer,
        color: playingCard.color,
        isPlacable: false
    };
    updateBoardState(game, card);
    return {
        card: card,
        game: game
    };
}

function updateBoardState(game, card) {
    const board = game.board.cells;
    const BOARD_SIZE = 6;

    const isValidPosition = (row, col) => row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    const isUnplacableSpot = (cell) => cell.type === 'unplacableSpot';
    const hasCard = (cell) => cell.value !== undefined;

    const isBoardEmpty = board.every(row => row.every(cell => isUnplacableSpot(cell)));

    if (isBoardEmpty) {
        const midStart = Math.floor(BOARD_SIZE / 2) - 1;
        const middlePositions = [
            [midStart, midStart],
            [midStart, midStart + 1],
            [midStart + 1, midStart],
            [midStart + 1, midStart + 1]
        ];
        middlePositions.forEach(([row, col]) => {
            board[row][col] = { type: 'placableSpot' };
        });
        return;
    }

    // Reset placable indicators
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if (cell.type === 'placableSpot') {
                board[row][col] = { type: 'unplacableSpot' };
            }
            if (cell.type === 'card' || cell.type === 'placableCard') {
                cell.type = 'card';
                cell.isPlacable = false;
            }
        }
    }

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // For each cell on the board
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];

            if (hasCard(cell) && cell.color !== card.color && cell.value < card.value) {
                board[row][col] = {
                    type: 'placableCard',
                    value: cell.value,
                    color: cell.color,
                    owner: cell.owner,
                    isPlacable: true
                };
            }

            if (hasCard(cell)) {
                directions.forEach(([dRow, dCol]) => {
                    const newRow = row + dRow;
                    const newCol = col + dCol;
                    if (isValidPosition(newRow, newCol) && isUnplacableSpot(board[newRow][newCol])) {
                        board[newRow][newCol] = {
                            type: 'placableSpot',
                        }
                    }
                });
            }
        }
    }
}

module.exports = { initGame, playerTurn };
