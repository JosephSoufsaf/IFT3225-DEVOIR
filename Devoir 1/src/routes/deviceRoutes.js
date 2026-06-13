const express = require("express");
const Device = require("../models/Device");
const router = new express.Router();

// GET /devices - Public visibility list
router.get("/devices", async (req, res) => {
    try {
        const devices = await Device.find({});
        return res.status(200).json({ success: true, data: devices });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST /devices - Open vulnerability registration point
router.post("/devices", async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name || !location) {
            return res.status(400).json({ success: false, error: "Champs requis manquants: name, location" });
        }

        const device = new Device({ name, location });
        await device.save();

        return res.status(201).json({ success: true, data: device });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;