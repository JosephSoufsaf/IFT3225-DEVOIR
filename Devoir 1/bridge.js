// bridge.js (Universal Zero-Parameter Array Extractor)
const PHONE_URL = "http://192.168.0.40:8080/get?calibration&dB=full&time=full"; 
const SERVER_URL = "http://localhost:8383/measurements";
const API_KEY = "api_f6afb4e6b23a85ab95e67cbcca577df10637719001df07e4"; 
const LOCATION_NAME = "Hotel_Lobby";

async function streamDataFromPhone() {
    try {
        // 1. USE THE FULL URL WITHOUT APPENDING '/get'
        const response = await fetch(PHONE_URL);
        const json = await response.json();

        // 2. USE YOUR PARSING LOGIC
        if (json.buffer && json.buffer.dB && json.buffer.dB.buffer) {
            const dbData = json.buffer.dB.buffer; 
            const latestDbValue = dbData[dbData.length - 1];

            // 3. ONLY PUSH IF WE HAVE A VALID NUMBER
            if (latestDbValue !== undefined && !Number.isNaN(latestDbValue)) {
                console.log(`Pushed: ${latestDbValue} dB to MongoDB`);

                const payload = {
                    type: "soundPressureLevel",
                    value: Number(latestDbValue),
                    location: LOCATION_NAME,
                    timestamp: new Date().toISOString()
                };

                // Send to your Express API
                await fetch(SERVER_URL, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "x-api-key": API_KEY 
                    },
                    body: JSON.stringify(payload)
                });
            }
        } else {
            console.warn(" -> Data received, but 'dB' buffer is missing or empty.");
        }
    } catch (error) {
        console.error("Bridge Connection Error:", error.message);
    }
}

console.log(`Starting Zero-Parameter Sync Pipeline. Target: ${LOCATION_NAME}...`);
// Query every 3 seconds
setInterval(streamDataFromPhone, 3000);