const { Server } = require('socket.io');
const { registerSocketEvents } = require('./events');

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // you can replace with your frontend URL later
        },
    });

    io.on('connection', (socket) => {
        registerSocketEvents(io, socket);
    });

    return io;
}

module.exports = { initSocketServer };