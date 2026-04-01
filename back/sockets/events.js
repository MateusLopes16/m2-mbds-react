const games = {};

const maxPlayersPerRoom = 4;

function registerSocketEvents(io, socket) {
    socket.on('joinRoom', async (room) => {
        const idSession = room?.id;

        if (!idSession || !room?.player) {
            emitToSocket(io, socket.id, 'error', { message: 'Invalid room payload' });
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

        const game = games[idSession];
        emitToSocket(io, socket.id, 'joinedRoom', game);
        emitToRoom(io, idSession, 'addPlayerToRoom', room.player);
    });
}

function emitToRoom(io, roomId, eventName, payload) {
    io.to(roomId).emit(eventName, payload);
}

function emitToSocket(io, socketId, eventName, payload) {
    io.to(socketId).emit(eventName, payload);
}

module.exports = { registerSocketEvents, emitToRoom, emitToSocket };