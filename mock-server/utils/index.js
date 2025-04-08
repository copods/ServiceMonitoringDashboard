const fs = require('fs');

const getmonitorData = (dataPath) => {
    try {
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(rawData);
        } else {
            console.error("monitor-data.json not found at:", dataPath);
            return { services: [], domains: [] };
        }
    } catch (error) {
        console.error("Error reading or parsing monitor-data.json:", error);
        return { services: [], domains: [] };
    }
};

const getNetworkData = (dataPath) => {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading network data file:", error);
        return { locations: [], routes: [], statistics: {} };
    }
};

module.exports = {
    getmonitorData,
    getNetworkData
};
