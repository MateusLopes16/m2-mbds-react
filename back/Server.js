const express = require('express');
const http = require('http');
const { initSocketServer } = require('./sockets');
const { initMongooseConnection } = require('./mongodb');

const app = express();
const server = http.createServer(app);

// Optional basic route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Initialize WebSocket server
initSocketServer(server);

// Initialize Mongoose connection once at startup.
initMongooseConnection().catch((error) => {
    console.error('[mongodb] Connection failed:', error.message);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HTTP + WebSocket server running on port ${PORT}`);
});