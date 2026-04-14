const mongoose = require('mongoose');
const { ReplayEvent } = require('./replayEvent.model');
const dotenv = require('dotenv');

dotenv.config();

const DEFAULT_MONGODB_URI = process.env.DEFAULT_MONGODB_URI;

/**
 * Initializes a mongoose connection if one is not already active.
 *
 * Uses MONGODB_URI when available, otherwise falls back to DEFAULT_MONGODB_URI.
 * @returns {Promise<import('mongoose').Connection>} Active mongoose connection
 */
async function initMongooseConnection() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[mongodb] Connected');
    return mongoose.connection;
}

/**
 * Checks whether a value is a plain JSON-like object (non-null, non-array).
 *
 * @param {any} value - Value to validate
 * @returns {boolean} True when value is an object and not an array
 */
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

/**
 * Retrieves the latest replay document for a given session.
 *
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object|null>} Replay object or null if not found
 */
async function getReplayBySession(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('getReplayBySession expects a valid sessionId');
    }

    if (mongoose.connection.readyState !== 1) {
        await initMongooseConnection();
    }

    return ReplayEvent.findOne({ type: 'gameReplay', sessionId }).sort({ updatedAt: -1 }).lean();
}

/**
 * Lists replay summaries for all sessions, ordered by most recent updates.
 *
 * @returns {Promise<Array<Object>>} Lightweight replay summary documents
 */
async function getReplaySummaries() {
    if (mongoose.connection.readyState !== 1) {
        await initMongooseConnection();
    }

    return ReplayEvent.find({ type: 'gameReplay' })
        .sort({ updatedAt: -1 })
        .select('sessionId players replayMoveCount winner updatedAt createdAt')
        .lean();
}

module.exports = {
    initMongooseConnection,
    saveJsonObject,
    upsertJsonObjectBySession,
    getReplayBySession,
    getReplaySummaries
};