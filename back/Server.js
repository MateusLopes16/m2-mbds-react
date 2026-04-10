const express = require('express');
const http = require('http');
const { initSocketServer } = require('./sockets');
const { initMongooseConnection, getReplayBySession, getReplaySummaries } = require('./mongodb');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// Optional basic route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.get('/replays', async (req, res) => {
    try {
        const replays = await getReplaySummaries();
        return res.json(replays);
    } catch (error) {
        console.error('[replay] Failed to list replays:', error.message);
        return res.status(500).json({ message: 'Failed to list replays' });
    }
});

app.get('/replays/:sessionId', async (req, res) => {
    try {
        const replay = await getReplayBySession(req.params.sessionId);
        if (!replay) {
            return res.status(404).json({ message: 'Replay not found' });
        }

        return res.json(replay);
    } catch (error) {
        console.error('[replay] Failed to fetch replay:', error.message);
        return res.status(500).json({ message: 'Failed to fetch replay' });
    }
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