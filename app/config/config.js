const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path : path.join(__dirname, '.env')
});
const procEnv = process.env;

const config = {
    path : {
        FABRIC_NETWORK_PATH : procEnv.FABRIC_NETWORK_PATH
    }
};

module.exports = config;