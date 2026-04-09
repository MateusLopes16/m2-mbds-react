const mongoose = require('mongoose');

const replayEventSchema = new mongoose.Schema(
    {},
    {
        strict: false,
        timestamps: true,
        versionKey: false,
        collection: 'game_replay_events'
    }
);

const ReplayEvent = mongoose.models.ReplayEvent || mongoose.model('ReplayEvent', replayEventSchema);

module.exports = { ReplayEvent };
