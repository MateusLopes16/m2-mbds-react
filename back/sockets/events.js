const games = {};
const maxPlayersPerRoom = 4;
const { initGame, playerTurn } = require('../model/Game');

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
        games[idSession] = { ...game, ...initializedGame };

        emitToRoom(io, idSession, 'gameStarted', games[idSession]);
        emitToRoom(io, idSession, 'playerTurn', playerTurn(games[idSession]));
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