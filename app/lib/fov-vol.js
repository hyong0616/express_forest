'use strict';

const path = require('path');
const config = require('../config/config');

const FovConfig = require('./fov-config');

const FovVol = (async function(user) {
    const ccpPath = path.resolve(config.path.FABRIC_NETWORK_PATH, 'organizations', 'peerOrganizations', 'vol1.example.com', 'connection-vol1.json');
    const conPath = path.join(process.cwd(), 'volent');

    let fovVol = await FovConfig({ ccpPath:ccpPath, walPath:conPath });
    
    fovVol.invokeChain = async function(time, date, service, certi) {
        try {
            const contract = await this.connect(user);
            await contract.submitTransaction('createVolent', 'VOLENT', time, date, service, certi);
            console.log('Transaction has been submitted');
            await this.disconnect();
        } catch (err) {
            console.log(err);
        }
    }
    
    return fovVol;
});

module.exports = FovVol;