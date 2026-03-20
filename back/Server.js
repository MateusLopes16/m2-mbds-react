const express = require('express');
const http = require('http');
const { initSocketServer } = require('./sockets');

const app = express();
const server = http.createServer(app);

// Optional basic route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Initialize WebSocket server
initSocketServer(server);

// Initialize Mongoose connection
initMongooseConnection();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HTTP + WebSocket server running on port ${PORT}`);
});