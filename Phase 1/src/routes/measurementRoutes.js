const express = require("express");
const Measurement = require("../models/Measurement");
const Observation = require("../models/Observation");
const auth = require("../middlewares/authentification");
const router = new express.Router();

// POST /measurements - Secure ingestion point
router.post("/measurements", auth, async (req, res) => {
    try {
        const { type, value, location, timestamp } = req.body;
        
        const dataPayload = new Measurement({
            type,
            value,
            location,
            timestamp: timestamp ? new Date(timestamp) : undefined
        });

        await dataPayload.save();
        return res.status(201).json({ success: true, data: dataPayload });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

// POST /observations - Manual Entry Ingestion / Fallback point
router.post("/observations", auth, async (req, res) => {
    try {
        const { location, proximity, vibe, notes, timestamp } = req.body;

        const manualLog = new Observation({
            location,
            proximity,
            vibe,
            notes,
            timestamp: timestamp ? new Date(timestamp) : undefined
        });

        await manualLog.save();
        return res.status(201).json({ success: true, data: manualLog });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;