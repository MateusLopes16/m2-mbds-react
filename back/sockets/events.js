const games = {};
const maxPlayersPerRoom = 4;
const { initGame, playerTurn, checkWin, removeBestPlacedCardFromPlayer, resetGameBoard } = require('../model/Game');
const { upsertJsonObjectBySession } = require('../mongodb');

function checkPlayerAlreadyInRoom(game, playerName) {
    return game.players.some((player) => player.name === playerName);
}

function createUniqueIdSession() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function registerSocketEvents(io, socket) {
    socket.on('joinRoom', handleJoinRoom(io, socket));
    socket.on('leaveRoom', handleLeaveRoom(io, socket));
    socket.on('startGame', handleStartGame(io, socket));
    socket.on('disconnect', handleDisconnect(io, socket));
    socket.on('placeCard', handlePlaceCard(io, socket));
}

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

function buildReplayTurn(game, playerName, card, position) {
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
        boardState: sanitizeBoardForReplay(game.board.cells)
    };
}

function buildGameReplayObjectForMongo(game, idSession) {
    return {
        type: 'gameReplay',
        sessionId: idSession,
        replayMoveCount: game.replayMoveCount || 0,
        currentPlayerIndex: game.currentPlayerIndex,
        players: game.players.map((player) => ({
            name: player.name,
            isHost: !!player.isHost,
            color: player.color,
            cardsRemaining: player.cards?.length || 0
        })),
        game: game.replayTimeline || []
    };
}

function logGameObjectForMongo(gameObjectForMongo) {
    console.log('[replay] Game object sent to MongoDB (state change):');
    console.log(JSON.stringify(gameObjectForMongo, null, 2));
}

async function persistGameReplay(game, idSession) {
    const gameObjectForMongo = buildGameReplayObjectForMongo(game, idSession);
    await upsertJsonObjectBySession(idSession, gameObjectForMongo);
}

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

        const replayTurn = buildReplayTurn(game, playerName, card, { x, y });
        game.replayTimeline = game.replayTimeline || [];
        game.replayTimeline.push(replayTurn);

        const gameObjectForMongo = buildGameReplayObjectForMongo(game, idSession);
        logGameObjectForMongo(gameObjectForMongo);


        if (checkWin(game, board[x][y])) {
            player.score = (player.score || 0) + 1;
            emitToRoom(io, idSession, 'playerPoint', game);

            if (player.score === 2) {
                game.winner = player.name;
                try {
                    await persistGameReplay(game, idSession);
                    console.log(`[replay] Final replay saved for session ${idSession} (winner: ${player.name})`);
                } catch (error) {
                    console.error('[replay] Failed to save final replay:', error.message);
                }
                emitToRoom(io, idSession, 'gameEnded', game);
                return;
            }

            removeBestPlacedCardFromPlayer(game, player, board[x][y].color);
            resetGameBoard(game);
            emitToRoom(io, idSession, 'playerTurn', playerTurn(game));
            return;
        }

        emitToRoom(io, idSession, 'gameUpdated', game);
        emitToRoom(io, idSession, 'playerTurn', playerTurn(game));
    };
}

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

function emitToRoom(io, roomId, eventName, payload) {
    io.to(roomId).emit(eventName, payload);
}

function emitToSocket(io, socketId, eventName, payload) {
    io.to(socketId).emit(eventName, payload);
}

module.exports = { registerSocketEvents, emitToRoom, emitToSocket };