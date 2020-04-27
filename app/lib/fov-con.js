'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const FovConfig = require('./fov-config');

class FovCon extends FovConfig {
    constructor(user='default') {
        const ccpPath = path.resolve(config.path.FABRIC_NETWORK_PATH, 'organizations', 'peerOrganizations', 'con1.example.com', 'connection-con1.json');
        const conPath = path.join(process.cwd(), 'con');
        
        super(ccpPath, conPath, user);
    }

    async init(){
        const ccpPath = path.resolve(config.path.FABRIC_NETWORK_PATH, 'organizations', 'peerOrganizations', 'con1.example.com', 'connection-con1.json');
        const conPath = path.join(process.cwd(), 'con');

        await super.init(ccpPath, conPath, 'common');
    }
    
    async getVolentByUser(identityValue){
        try{
            return this._contract.evaluateTransaction('queryVolent', identityValue); 
        } catch (err) {
            return '';
        }
    }
}

module.exports = FovCon;