const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true
    },
    proximity: {
        type: String,
        required: true,
        enum: ["close", "moderate", "distant", "none"]
    },
    vibe: {
        type: String,
        required: true,
        trim: true // Example: "Calm", "Studious", "Chaotic"
    },
    notes: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { strict: "throw" });

module.exports = mongoose.model("Observation", observationSchema);