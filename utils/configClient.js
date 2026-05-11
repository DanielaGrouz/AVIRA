require('dotenv').config();

const getConfig = (configKey) => {
    return process.env[configKey];
}

exports.getConfig = getConfig;