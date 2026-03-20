let roomUserCount = {};
let socketToRoom = {};
let roomEmitState = {};
const emitInterval = 1000;

function registerSocketEvents(io, socket) {
    // On events
    socket.on('checkSessionExist', async (sessionId) => {
        if (io.sockets.adapter.rooms.has(sessionId)) {
            socket.emit('sessionExist');
        } else {
            socket.emit('sessionNotExist');
        }
    });

    socket.on('disconnect', async () => {
        console.log('Socket disconnected: ' + socket.id);
        const roomId = socketToRoom[socket.id];
        if (roomId && roomUserCount[roomId] && roomUserCount[roomId] > 0) {
            roomUserCount[roomId]--;
            if (roomUserCount[roomId] <= 0) {
                delete roomUserCount[roomId];
                delete roomEmitState[roomId];
            } else {
                broadcastUserCount(io, roomId);
            }
        }
        delete socketToRoom[socket.id];
    });

    socket.on('playerJoinGame', async (data) => {
        console.log('Player joined game with data: ', data);
        const idSession = data.idSession;
        await socket.join(idSession);
        if (!roomUserCount[idSession]) {
            roomUserCount[idSession] = 0;
        }

        roomUserCount[idSession]++;
        socketToRoom[socket.id] = idSession;
        broadcastUserCount(io, idSession);
    });

    socket.on('hostLaunchGame', async () => {
        console.log('Host launched game for socket ID: ' + socket.id);
        const roomId = socketToRoom[socket.id];
        if (roomId) {
            io.to(roomId).emit('launchGame');
        } else {
            console.log('Room ID not found for socket ' + socket.id);
        }
    });

    socket.on('playerPlaceCard', (data) => {
        console.log('Player placed card with data: ', data);
        const idSession = socketToRoom[socket.id];
        if (idSession) {
            if (data !== undefined) {
                const { userId, cardCoordinates } = data;
                io.to(idSession).emit('updateBoard', { userId, cardCoordinates });
            }
        }
    });


    socket.on('updateUserCount', async () => {
        console.log('Updating user count for socket ID: ' + socket.id);
        const roomId = socketToRoom[socket.id];
        if (roomId) {
            broadcastUserCount(io, roomId);
        } else {
            console.log('Room ID not found for socket ' + socket.id);
        }
    });
}

/**
 * Broadcast the current user count to everyone in a room.
 * Uses per-room throttling to avoid spamming and cross-room interference.
 * @param {string} idSession
 */
function broadcastUserCount(io, idSession) {
    if (!idSession) {
        return;
    }

    const currentTime = Date.now();
    if (!roomEmitState[idSession]) {
        roomEmitState[idSession] = {
            lastEmitTime: 0,
            pendingRequest: null,
        };
    }

    const state = roomEmitState[idSession];
    const userCount = roomUserCount[idSession] ?? 0;

    const emitToRoom = () => {
        io.to(idSession).emit('updateUserCount', userCount);
        state.lastEmitTime = Date.now();
    };

    if (currentTime - state.lastEmitTime > emitInterval) {
        emitToRoom();

        if (state.pendingRequest) {
            clearTimeout(state.pendingRequest);
            state.pendingRequest = null;
        }
    } else {
        if (state.pendingRequest) {
            clearTimeout(state.pendingRequest);
        }

        state.pendingRequest = setTimeout(() => {
            emitToRoom();
            state.pendingRequest = null;
        }, emitInterval - (currentTime - state.lastEmitTime));
    }
}

module.exports = { registerSocketEvents };