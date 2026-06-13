const express = require("express");
const Measurement = require("../models/Measurement");
const Observation = require("../models/Observation");
const router = new express.Router();

// 1. GET /ambiance/:location/portrait - Aggregated Live State
router.get("/ambiance/:location/portrait", async (req, res) => {
    try {
        const { location } = req.params;

        // Fetch numerical metrics from the last 30 minutes
		// Instead of Date.now(), set it to a hardcoded date in the past
		const cutoffTime = new Date("2000-01-01T00:00:00.000Z");
        const metrics = await Measurement.find({
            location,
            type: "soundPressureLevel",
            timestamp: { $gte: cutoffTime }
        });

        // Fetch latest qualitative note context
        const lastObservation = await Observation.findOne({ location }).sort({ timestamp: -1 });

        if (metrics.length === 0) {
            return res.status(200).json({
                success: true,
                location,
                message: "Aucune donnée récente pour générer un portrait.",
                status: "Unknown"
            });
        }

        const totalValue = metrics.reduce((sum, item) => sum + item.value, 0);
        const averageSound = totalValue / metrics.length;

        // Semantic portrait thresholds mapping
        let classification = "Modéré";
        if (averageSound < -60) classification = "Très Calme";
        else if (averageSound < -50) classification = "Calme";
        else if (averageSound > -40) classification = "Bruyant";

        return res.status(200).json({
            success: true,
            location,
            generatedAt: new Date().toISOString(),
            dataPointsAnalyzed: metrics.length,
            averages: { soundPressureLevelDb: Math.round(averageSound * 100) / 100 },
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

// 2. GET /ambiance/:location/history - Filterable Time Range Window Lookup
router.get("/ambiance/:location/history", async (req, res) => {
    try {
        const { location } = req.params;
        const lastHours = parseInt(req.query.last) || 3; // Defaults to 3-hour lookback window

        const startTime = new Date(Date.now() - lastHours * 60 * 60 * 1000);

        const timeline = await Measurement.find({
            location,
            timestamp: { $gte: startTime }
        }).sort({ timestamp: 1 });

        return res.status(200).json({
            success: true,
            location,
            timeWindowHours: lastHours,
            count: timeline.length,
            history: timeline
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// 3. GET /ambiance/:location/quiet-hours - Historical Aggregation Breakdown Matrix
router.get("/ambiance/:location/quiet-hours", async (req, res) => {
    try {
        const { location } = req.params;

        // Group measurement logs using MongoDB's Aggregation Engine to calculate averages grouped by hour slots
        const hourlyStats = await Measurement.aggregate([
            { $match: { location, type: "soundPressureLevel" } },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    averageDecibels: { $avg: "$value" },
                    totalLogs: { $sum: 1 }
                }
            },
            { $sort: { averageDecibels: 1 } } // Sort ascending (quietest hour comes first)
        ]);

        return res.status(200).json({
            success: true,
            location,
            calculatedAt: new Date().toISOString(),
            description: "Créneaux horaires ordonnés du plus calme au plus bruyant",
            hourlyRanking: hourlyStats.map(stat => ({
                hourSlot24h: stat._id,
                averageSoundDb: Math.round(stat.averageDecibels * 100) / 100,
                sampleDensity: stat.totalLogs
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Export the routes to mount safely inside your main app
module.exports = router;