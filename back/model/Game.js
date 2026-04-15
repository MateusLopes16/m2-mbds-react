const BOARD_SIZE = 6;
const colors = ['red', 'blue', 'green', 'orange'];

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
        players[0].color = [colors[0], colors[3]];
        players[1].color = [colors[1], colors[3]];
        players[2].color = [colors[2], colors[3]];
        // colors[3] is unassigned
    } else if (numPlayers === 4) {
        // Each player receives 1 color
        players.forEach((player, index) => {
            player.color = [colors[index]];
        });
    }
}

/**
 * Distributes cards to players according to Punto rules and player count.
 *
 * Card distribution:
 * - 2 players: each player gets 2 copies of values 1-9 for each of their 2 colors
 * - 3 players: each player gets 2 copies of values 1-9 for their non-shared color,
 *   then shared color cards are shuffled and distributed evenly
 * - 4 players: each player gets 2 copies of values 1-9 for their single color
 *
 * @param {Array<Object>} players - Players with pre-assigned colors
 * @returns {void}
 */
function giveCardsToPlayers(players) {
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
        let assignedColors = players.map(p => p.color[0]);
        let unassignedColors = colors.filter(c => !assignedColors.includes(c));
        const sharedColor = unassignedColors[0];

        // 3 players: each gets 2 of each value for their main color
        // Shared color (colors[3]) cards are shuffled among all players
        players.forEach((player) => {
            const playerColorNotShared = player.color.find(c => c !== sharedColor);
            values.forEach((value) => {
                for (let i = 0; i < 2; i++) {
                    player.cards.push({
                        value: value,
                        color: playerColorNotShared
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
                    color: sharedColor
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

/**
 * Advances to the next player that still has cards, picks one random card,
 * updates board placable states for that card, and returns turn payload.
 *
 * @param {Object} game - Current game state
 * @returns {{card: Object, game: Object}|undefined} Next turn data, or undefined if game is invalid
 */
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

/**
 * Recomputes board state after considering a candidate card:
 * - Initializes center placable spots on an empty board
 * - Clears previous placable indicators
 * - Marks adjacent empty cells (orthogonal and diagonal) as placable spots
 * - Marks lower-value cards as placable targets
 *
 * @param {Object} game - Current game state containing board cells
 * @param {Object} card - Candidate card to evaluate placements for
 * @returns {void}
 */
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

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];

    // For each cell on the board
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];

            if (hasCard(cell) && cell.value < card.value) {
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

/**
 * Checks whether the last placed card completes a 4-card alignment
 * of the same color horizontally, vertically, or diagonally.
 *
 * @param {Object} game - Current game state
 * @param {Object} placedCard - Card that has just been placed
 * @returns {Array<{x:number,y:number}>|null} Winning line coordinates, or null
 */
function findWinningLine(game, placedCard) {
    const board = game.board.cells;
    const BOARD_SIZE = 6;
    const WIN_LENGTH = 4;
    const cardColor = placedCard.color;

    // Helper function to check if a cell has a card and matches the color
    const matchesColor = (row, col) => {
        const cell = board[row][col];
        return (cell.type === 'card' || cell.type === 'placableCard') && cell.color === cardColor;
    };

    // Directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (const [dRow, dCol] of directions) {
                const endRow = row + (WIN_LENGTH - 1) * dRow;
                const endCol = col + (WIN_LENGTH - 1) * dCol;

                // Skip directions that would go out of bounds from this start cell
                if (endRow < 0 || endRow >= BOARD_SIZE || endCol < 0 || endCol >= BOARD_SIZE) {
                    continue;
                }

                let aligned = true;
                const winningLine = [];
                for (let step = 0; step < WIN_LENGTH; step++) {
                    const currentRow = row + step * dRow;
                    const currentCol = col + step * dCol;
                    if (!matchesColor(currentRow, currentCol)) {
                        aligned = false;
                        break;
                    }

                    winningLine.push({ x: currentRow, y: currentCol });
                }

                if (aligned) {
                    return winningLine;
                }
            }
        }
    }

    return null;
}

/**
 * Boolean helper kept for compatibility with existing game logic.
 *
 * @param {Object} game - Current game state
 * @param {Object} placedCard - Card that has just been placed
 * @returns {boolean} True if a winning alignment is found
 */
function checkWin(game, placedCard) {
    return !!findWinningLine(game, placedCard);
}

/**
 * Removes the highest-value card of the winning color owned by the given player
 * from the board after a point is scored.
 *
 * @param {Object} game - Current game state
 * @param {Object} player - Player who scored
 * @param {string} winningColor - Color that produced the winning alignment
 * @returns {void}
 */
function removeBestPlacedCardFromPlayer(game, player, winningColor) {
    const board = game.board.cells;
    let bestCard = null;
    let bestPosition = null;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            // Only consider cards of the winning color owned by this player
            if ((cell.type === 'card' || cell.type === 'placableCard') &&
                cell.owner.name === player.name &&
                cell.color === winningColor) {
                if (!bestCard || cell.value > bestCard.value) {
                    bestCard = cell;
                    bestPosition = { row, col };
                }
            }
        }
    }
    if (bestPosition) {
        board[bestPosition.row][bestPosition.col] = { type: 'unplacableSpot' };
    }
}

/**
 * Returns all cards currently on the board to their respective owners' hands,
 * then resets every board cell to unplacableSpot.
 *
 * @param {Object} game - Current game state
 * @returns {void}
 */
function resetGameBoard(game) {
    const board = game.board.cells;

    // Return all remaining cards on the board to their owners' hands
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if ((cell.type === 'card' || cell.type === 'placableCard') && cell.owner) {
                // Add the card back to the owner's hand
                const owner = game.players.find((p) => p.name === cell.owner.name);
                if (owner) {
                    owner.cards.push({
                        value: cell.value,
                        color: cell.color
                    });
                }
            }
        }
    }

    // Clear the board only after every card was returned
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = { type: 'unplacableSpot' };
        }
    }
}

module.exports = { initGame, playerTurn, checkWin, findWinningLine, removeBestPlacedCardFromPlayer, resetGameBoard };
