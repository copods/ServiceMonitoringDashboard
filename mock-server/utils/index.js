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

const getMOSData = (dataPath) => {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading MOS data:', error);
      return {};
    }
  };
module.exports = {
    getmonitorData,
    getMOSData
};
