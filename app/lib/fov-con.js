'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const FovConfig = require('./fov-config');

module.exports = (async function(user) {
    const ccpPath = path.resolve(config.path.FABRIC_NETWORK_PATH, 'organizations', 'peerOrganizations', 'con1.example.com', 'connection-con1.json');
    const conPath = path.join(process.cwd(), 'con');

    let fovCon = await FovConfig({ ccpPath:ccpPath, walPath:conPath });
    
    fovCon.getVolentByUser = async (identityValue) => {
        let value = '';
        try{
            const contract = await fovCon.connect(user);
            value = contract.evaluateTransaction('queryVolent', identityValue); 
            await fovCon.disconnect();
        } catch (err) {
            console.log(err);
        }

        return value;
    }

    fovCon.getAllVolents = async () => {
        let value = '';
        try{
            const contract = await fovCon.connect(user);
            value = contract.evaluateTransaction('queryAllVolents'); 
            await fovCon.disconnect();
        } catch (err) {
            console.log(err);
        }

        return value;
    }
    return fovCon;
});