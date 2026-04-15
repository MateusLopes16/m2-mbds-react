const games = {};
const maxPlayersPerRoom = 4;
const { initGame, playerTurn, findWinningLine, removeBestPlacedCardFromPlayer, resetGameBoard } = require('../model/Game');
const { upsertJsonObjectBySession } = require('../mongodb');

const WINNING_LINE_HIGHLIGHT_MS = 2400;

/**
 * Checks whether a player name is already present in a room.
 *
 * @param {Object} game - Room/game object containing players
 * @param {string} playerName - Player name to validate
 * @returns {boolean} True if player name already exists in the room
 */
function checkPlayerAlreadyInRoom(game, playerName) {
    return game.players.some((player) => player.name === playerName);
}

/**
 * Generates a short uppercase session identifier.
 *
 * @returns {string} A 6-character room/session id
 */
function createUniqueIdSession() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * Registers all socket event handlers for a client connection.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @returns {void}
 */
function registerSocketEvents(io, socket) {
    socket.on('joinRoom', handleJoinRoom(io, socket));
    socket.on('leaveRoom', handleLeaveRoom(io, socket));
    socket.on('startGame', handleStartGame(io, socket));
    socket.on('disconnect', handleDisconnect(io, socket));
    socket.on('placeCard', handlePlaceCard(io, socket));
}

/**
 * Sanitizes board cells for replay persistence by normalizing owner values.
 *
 * @param {Array<Array<Object>>} boardCells - Current board cell matrix
 * @returns {Array<Array<Object>>} Serializable board matrix for replay history
 */
function sanitizeBoardForReplay(boardCells) {
    return boardCells.map((row) =>
        row.map((cell) => {
            const ownerName = typeof cell.owner === 'object' ? cell.owner?.name : cell.owner;
            return {
                type: cell.type,
                value: cell.value,
                color: cell.color,
                owner: ownerName,
                isPlacable: cell.isPlacable
            };
        })
    );
}

/**
 * Builds a replay entry for a played turn and increments move counter.
 *
 * @param {Object} game - Current game state
 * @param {string} playerName - Name of the player who played
 * @param {Object} card - Card that was played
 * @param {{x: number, y: number}} position - Board position where card was placed
 * @returns {Object} Replay turn object
 */
function buildReplayTurn(game, playerName, card, position, scoringContext = {}) {
    const moveNumber = (game.replayMoveCount || 0) + 1;
    game.replayMoveCount = moveNumber;

    return {
        turn: moveNumber,
        playerName,
        playedCard: {
            value: card.value,
            color: card.color
        },
        position,
        playerScores: game.players.map((player) => ({
            name: player.name,
            score: player.score || 0
        })),
        scoringPlayerName: scoringContext.scoringPlayerName || null,
        winningLine: scoringContext.winningLine || null,
        boardState: sanitizeBoardForReplay(game.board.cells)
    };
}

/**
 * Creates the replay payload stored in MongoDB for a session.
 *
 * @param {Object} game - Current game state
 * @param {string} idSession - Session identifier
 * @returns {Object} Mongo-ready replay object
 */
function buildGameReplayObjectForMongo(game, idSession) {
    return {
        type: 'gameReplay',
        sessionId: idSession,
        winner: game.winner || null,
        replayMoveCount: game.replayMoveCount || 0,
        currentPlayerIndex: game.currentPlayerIndex,
        players: game.players.map((player) => ({
            name: player.name,
            isHost: !!player.isHost,
            color: player.color,
            score: player.score || 0,
            cardsRemaining: player.cards?.length || 0
        })),
        game: game.replayTimeline || []
    };
}

/**
 * Persists the current replay object for a session to MongoDB.
 *
 * @param {Object} game - Current game state
 * @param {string} idSession - Session identifier
 * @returns {Promise<void>}
 */
async function persistGameReplay(game, idSession) {
    const gameObjectForMongo = buildGameReplayObjectForMongo(game, idSession);
    await upsertJsonObjectBySession(idSession, gameObjectForMongo);
}

/**
 * Creates the placeCard event handler for a socket.
 * Validates placement, updates board and player hand, persists replay data,
 * and emits game progression events.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @returns {(placement: Object) => Promise<void>} Async placeCard handler
 */
function handlePlaceCard(io, socket) {
    return async (placement) => {
        const idSession = socket.data?.roomId;
        const playerName = socket.data?.playerName;

        if (!idSession || !playerName) {
            emitToSocket(io, socket.id, 'error', { message: 'Invalid placeCard payload: missing room or player info' });
            return;
        }

        const game = games[idSession];
        if (!game || !game.board) {
            emitToSocket(io, socket.id, 'error', { message: 'Game not found' });
            return;
        }

        const { card, position } = placement;
        if (!card || !position || position.x === undefined || position.y === undefined) {
            emitToSocket(io, socket.id, 'error', { message: 'Invalid placement data' });
            return;
        }

        const { x, y } = position;
        const placedPosition = { x, y };
        const board = game.board.cells;

        // Validate position is within bounds
        if (x < 0 || x >= 6 || y < 0 || y >= 6) {
            emitToSocket(io, socket.id, 'error', { message: 'Position out of bounds' });
            return;
        }

        const cellAtPosition = board[x][y];

        // Validate the cell is placable
        if (!cellAtPosition || (cellAtPosition.type !== 'placableSpot' && cellAtPosition.type !== 'placableCard')) {
            emitToSocket(io, socket.id, 'error', { message: 'Cell is not placable' });
            return;
        } else if (cellAtPosition.type === 'placableCard' || cellAtPosition.type === 'card') {
            // If placing on top of a card, return it to its owner's hand.
            const cardOwnerName = typeof cellAtPosition.owner === 'object' ? cellAtPosition.owner?.name : cellAtPosition.owner;
            const cardOwner = game.players.find((p) => p.name === cardOwnerName);
            if (cardOwner) {
                cardOwner.cards.push(cellAtPosition);
            }
        }

        // Place the card on the board
        board[x][y] = {
            type: 'card',
            value: card.value,
            owner: card.owner,
            color: card.color,
            isPlacable: false
        };

        // Remove the card from player's hand
        const player = game.players.find((p) => p.name === playerName);
        if (player && player.cards) {
            const cardIndex = player.cards.findIndex(
                (c) => c.value === card.value && c.color === card.color
            );
            if (cardIndex !== -1) {
                player.cards.splice(cardIndex, 1);
            }
        }

        const winningLine = findWinningLine(game, board[x][y]);
        let scoringPlayerName = null;

        if (winningLine) {
            player.score = (player.score || 0) + 1;
            scoringPlayerName = player.name;
            emitToRoom(io, idSession, 'playerPoint', { game, winningLine, placedPosition });

            const replayTurn = buildReplayTurn(game, playerName, card, { x, y }, { scoringPlayerName, winningLine });
            game.replayTimeline = game.replayTimeline || [];
            game.replayTimeline.push(replayTurn);
            buildGameReplayObjectForMongo(game, idSession);

            if (player.score === 2) {
                game.winner = player.name;
                try {
                    await persistGameReplay(game, idSession);
                } catch (error) {
                    console.error('[replay] Failed to save final replay:', error.message);
                }
                emitToRoom(io, idSession, 'gameEnded', { game, winningLine, placedPosition });
                return;
            }

            setTimeout(() => {
                removeBestPlacedCardFromPlayer(game, player, board[x][y].color);
                resetGameBoard(game);
                emitToRoom(io, idSession, 'playerTurn', playerTurn(game));
            }, WINNING_LINE_HIGHLIGHT_MS);
            return;
        }

        const replayTurn = buildReplayTurn(game, playerName, card, { x, y });
        game.replayTimeline = game.replayTimeline || [];
        game.replayTimeline.push(replayTurn);

        buildGameReplayObjectForMongo(game, idSession);

        emitToRoom(io, idSession, 'gameUpdated', { game, placedPosition });
        emitToRoom(io, idSession, 'playerTurn', playerTurn(game));
    };
}

/**
 * Creates the joinRoom event handler for a socket.
 * Handles room creation, capacity checks, player registration, and broadcasts.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @returns {(room: Object) => Promise<void>} Async joinRoom handler
 */
function handleJoinRoom(io, socket) {
    return async (room) => {
        let idSession = room?.id;
        if (idSession && !games[idSession]) {
            emitToSocket(io, socket.id, 'error', { message: 'room does not exist' });
            return;
        } else {
            if (!idSession) {
                idSession = createUniqueIdSession();
            }
        }

        if (!idSession || !room?.player) {
            emitToSocket(io, socket.id, 'error', { message: 'Invalid room payload' });
            return;
        }

        if (games[idSession] && checkPlayerAlreadyInRoom(games[idSession], room.player.name)) {
            emitToSocket(io, socket.id, 'error', { message: 'Player name already taken in this room' });
            return;
        }

        if (!games[idSession]) {
            games[idSession] = { id: idSession, players: [] };
            room.player.isHost = true;
        }

        if (games[idSession].players.length >= maxPlayersPerRoom) {
            emitToSocket(io, socket.id, 'error', { message: 'Room is full' });
            return;
        }

        await socket.join(idSession);
        games[idSession].players.push(room.player);
        socket.data.roomId = idSession;
        socket.data.playerName = room.player.name;

        const game = games[idSession];
        emitToSocket(io, socket.id, 'joinedRoom', game);
        emitToRoom(io, idSession, 'addPlayerToRoom', room.player);
    };
}

/**
 * Creates the leaveRoom event handler for a socket.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @returns {(payload: Object) => void} leaveRoom handler
 */
function handleLeaveRoom(io, socket) {
    return (payload) => {
        const idSession = payload?.id ?? socket.data?.roomId;
        const playerName = payload?.playerName ?? socket.data?.playerName;
        if (!idSession || !playerName) {
            emitToSocket(io, socket.id, 'error', { message: 'Invalid leaveRoom payload' });
            return;
        }

        const game = games[idSession];
        if (!game) {
            return;
        }

        removePlayerFromRoom(io, idSession, playerName);
        socket.leave(idSession);
    };
}

/**
 * Creates the startGame event handler for a socket.
 * Validates host permissions, initializes game state, and emits first turn.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @returns {(payload: Object) => void} startGame handler
 */
function handleStartGame(io, socket) {
    return (payload) => {
        const idSession = payload?.id;
        const playerName = payload?.playerName;
        if (!idSession || !playerName) {
            emitToSocket(io, socket.id, 'error', { message: 'Invalid startGame payload' });
            return;
        }

        const game = games[idSession];
        if (!game) {
            emitToSocket(io, socket.id, 'error', { message: 'Room not found' });
            return;
        }

        const currentPlayer = game.players.find((player) => player.name === playerName);
        if (!currentPlayer?.isHost) {
            emitToSocket(io, socket.id, 'error', { message: 'Only host can start game' });
            return;
        }

        // Initialize game with board and player colors
        const initializedGame = initGame(game.players);
        games[idSession] = { ...game, ...initializedGame, replayMoveCount: 0, replayTimeline: [] };

        const nextTurn = playerTurn(games[idSession]);

        emitToRoom(io, idSession, 'gameStarted', games[idSession]);
        emitToRoom(io, idSession, 'playerTurn', nextTurn);
    };
}

/**
 * Creates the disconnect event handler for a socket.
 * Removes disconnected player from their room if applicable.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @returns {() => void} disconnect handler
 */
function handleDisconnect(io, socket) {
    return () => {
        const idSession = socket.data?.roomId;
        const playerName = socket.data?.playerName;
        if (!idSession || !playerName || !games[idSession]) {
            return;
        }

        removePlayerFromRoom(io, idSession, playerName);
    };
}

/**
 * Removes a player from a room and handles room cleanup if necessary
 * 
 * @param {SocketIO.Server} io 
 * @param {string} roomId 
 * @param {string} playerName 
 * @returns 
 */
function removePlayerFromRoom(io, roomId, playerName) {
    const game = games[roomId];
    if (!game) {
        return;
    }

    const previousPlayers = game.players;
    game.players = previousPlayers.filter((player) => player.name !== playerName);
    if (game.players.length === 0) {
        delete games[roomId];
        return;
    }

    const hasHost = game.players.some((player) => player.isHost);
    if (!hasHost) {
        game.players[0].isHost = true;
    }

    emitToRoom(io, roomId, 'deletePlayerInRoom', game);
}

/**
 * Emits an event with payload to all sockets in a room.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {string} roomId - Target room id
 * @param {string} eventName - Event name to emit
 * @param {any} payload - Event payload
 * @returns {void}
 */
function emitToRoom(io, roomId, eventName, payload) {
    io.to(roomId).emit(eventName, payload);
}

/**
 * Emits an event with payload to a specific socket.
 *
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {string} socketId - Target socket id
 * @param {string} eventName - Event name to emit
 * @param {any} payload - Event payload
 * @returns {void}
 */
function emitToSocket(io, socketId, eventName, payload) {
    io.to(socketId).emit(eventName, payload);
}

module.exports = { registerSocketEvents, emitToRoom, emitToSocket };