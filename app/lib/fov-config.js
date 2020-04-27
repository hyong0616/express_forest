'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

class FovConfig {
    constructor(ccpPath, walPath, user) {
        this._admin = 'admin';
        this._pw = 'qwer1234';
        this.CHANNEL = 'mychannel';
        this.CONTRACT_NAME = 'fov';
        this._gateway = '';
        this._wallet='';
        this.ccpPath = ccpPath;
        this.walPath = walPath;
        this.user = user;
    }

    async init(){
        try{
            this._ccp = JSON.parse(fs.readFileSync(this.ccpPath, 'utf8'));
            this._wallet = await Wallets.newFileSystemWallet(this.walPath);
            this._org = this._ccp.client.organization;
            this._cert = this._ccp.organizations[this._org]['certificateAuthorities'];
            this._msp = this._ccp.organizations[this._org]['mspid'];
            const caURL = this._ccp.certificateAuthorities[this._cert].url;
            this._ca = new FabricCAServices(caURL);

            this._identity = await this._wallet.get(this.user);
            if (!this._identity) {
                this._identity = await this.registUser(this.user);
                // return false;
            }

            this._gateway = new Gateway();
            await this._gateway.connect(this._ccp, { wallet: this._wallet, identity: this.user, discovery: { enabled: true, asLocalhost: true } });

            const network = await this._gateway.getNetwork(this.CHANNEL);
            this._contract = network.getContract(this.CONTRACT_NAME);
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }

    async registUser() {
        let identity;
        try{
            const userIdentity = await this._wallet.get(this.user);
            if (userIdentity) {
                return userIdentity;
            }
    
            let adminIdentity = await this._wallet.get(this._admin);
            if (!adminIdentity) {
                adminIdentity = await this.enrollAdmin();
            }

            const provider = this._wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, this._admin);

            const secret = await this._ca.register({
                affiliation: 'org1.department1',
                enrollmentID: this.user,
                role: 'client'
            }, adminUser);
            const enrollment = await this._ca.enroll({
                enrollmentID: this.user,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: this._msp,
                type: 'X.509',
            };
            await this._wallet.put(this.user, x509Identity);
            console.log(`Successfully registered user ${this.user} and imported it into the wallet`);
            identity = x509Identity;
        } catch (err) {
            console.log(err);
            identity = null;
        }
        return identity;
    }

    async enrollAdmin() {
        let identity;
        try{
            const adminIdentity = await this._wallet.get(this._admin);
            if (adminIdentity) {
                return adminIdentity;
            }
            const caInfo = this._ccp.certificateAuthorities[this._cert];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            const enrollment = await ca.enroll({ enrollmentID: this._admin, enrollmentSecret: this._pw });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: this._msp,
                type: 'X.509',
            };
            await this._wallet.put(this._admin, x509Identity);
            identity = x509Identity;
        } catch (err) {
            console.log(err);
        }
        return identity;
    }
}

module.exports = FovConfig;