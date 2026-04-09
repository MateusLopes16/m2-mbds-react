const mongoose = require('mongoose');
const { ReplayEvent } = require('./replayEvent.model');

const DEFAULT_MONGODB_URI = 'mongodb://root:password@localhost:27017/games?authSource=admin';

async function initMongooseConnection() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[mongodb] Connected');
    return mongoose.connection;
}

function isJsonObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Generic persistence helper for backend-only JSON payloads.
 * @param {Object} jsonObject
 * @returns {Promise<Object>}
 */
async function saveJsonObject(jsonObject) {
    if (!isJsonObject(jsonObject)) {
        throw new Error('saveJsonObject expects a JSON object');
    }

    if (mongoose.connection.readyState !== 1) {
        await initMongooseConnection();
    }

    return ReplayEvent.create(jsonObject);
}

/**
 * Upserts a replay document by sessionId so a whole game timeline
 * is stored in a single JSON object.
 * @param {string} sessionId
 * @param {Object} jsonObject
 * @returns {Promise<Object>}
 */
async function upsertJsonObjectBySession(sessionId, jsonObject) {
    if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('upsertJsonObjectBySession expects a valid sessionId');
    }

    if (!isJsonObject(jsonObject)) {
        throw new Error('upsertJsonObjectBySession expects a JSON object');
    }

    if (mongoose.connection.readyState !== 1) {
        await initMongooseConnection();
    }

    return ReplayEvent.findOneAndUpdate(
        { type: 'gameReplay', sessionId },
        { $set: jsonObject },
        { upsert: true, returnDocument: 'after' }
    );
}

module.exports = {
    initMongooseConnection,
    saveJsonObject,
    upsertJsonObjectBySession
};