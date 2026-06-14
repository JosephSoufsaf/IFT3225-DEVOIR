const Measurement = require("../models/measurements");
const Observation = require('../models/observations')
const express = require('express');
const router = new express.Router();


router.get("/ambiance/:location/quiet-hours", async (req, res) => {
    try {
        const { location } = req.params;

        // Récupère toutes les mesures du lieu
        const measurements = await Measurement.find({ 
            location, 
            type: "soundPressureLevel" 
        });

        if (measurements.length === 0) {
            return res.status(200).json({ success: true, location, hourlyRanking: [] });
        }

        // Groupe par heure
        const hourlyGroups = {};
        measurements.forEach(m => {
            const hour = new Date(m.timestamp).getHours();
            if (!hourlyGroups[hour]) {
                hourlyGroups[hour] = { total: 0, count: 0 };
            }
            hourlyGroups[hour].total += m.value;
            hourlyGroups[hour].count += 1;
        });

        // Calcule la moyenne par heure et trie
        const hourlyRanking = Object.entries(hourlyGroups)
            .map(([hour, data]) => ({
                hourSlot24h: parseInt(hour),
                averageSoundDb: Math.round((data.total / data.count) * 100) / 100,
                sampleDensity: data.count
            }))
            .sort((a, b) => a.averageSoundDb - b.averageSoundDb);

        return res.status(200).json({ success: true, location, hourlyRanking });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/ambiance/:location/history", async (req, res) => {
    try {
        const { location } = req.params;
        const lastHours = parseInt(req.query.last) || 3;

        const startTime = new Date(Date.now() - lastHours * 60 * 60 * 1000);

        const measurements = await Measurement.find({
            location,
            timestamp: { $gte: startTime }
        }).sort({ timestamp: 1 });

        return res.status(200).json({
            success: true,
            location,
            timeWindowHours: lastHours,
            count: measurements.length,
            history: measurements
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/ambiance/:location/portrait", async (req, res) => {
    try {
        const { location } = req.params;

        const cutoffTime = new Date(Date.now() - 30 * 60 * 1000);

        const measurements = await Measurement.find({
            location,
            type: "soundPressureLevel",
            timestamp: { $gte: cutoffTime }
        });

        const lastObservation = await Observation.findOne({ location })
            .sort({ timestamp: -1 });

        if (measurements.length === 0) {
            return res.status(200).json({
                success: true,
                location,
                message: "Aucune donnée récente.",
                status: "Unknown"
            });
        }

        const average = measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length;

        let classification = "Modéré";
        if (average < -60) classification = "Très Calme";
        else if (average < -50) classification = "Calme";
        else if (average > -40) classification = "Bruyant";

        return res.status(200).json({
            success: true,
            location,
            generatedAt: new Date().toISOString(),
            dataPointsAnalyzed: measurements.length,
            averageSoundDb: Math.round(average * 100) / 100,
            semanticPortrait: {
                noiseClass: classification,
                humanProximity: lastObservation ? lastObservation.proximity : "Inconnue",
                reportedVibe: lastObservation ? lastObservation.vibe : "Inconnue"
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;