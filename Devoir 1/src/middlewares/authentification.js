const Device = require("../models/Device");

const authentification = async (req, res, next) => {
    try {
        const apiKey = req.header("x-api-key");
        
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: "Accès refusé : En-tête x-api-key absent"
            });
        }

        const device = await Device.findOne({ apiKey });
        if (!device) {
            return res.status(403).json({
                success: false,
                error: "Accès interdit : Clé API invalide"
            });
        }

        // Attach verified properties to request stream context
        req.device = device;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Erreur d'authentification interne",
            details: error.message
        });
    }
};

module.exports = authentification;