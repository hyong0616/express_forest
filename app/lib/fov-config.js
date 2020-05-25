'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

module.exports = (async function(config) {
    const ccpPath = config.ccpPath;
    const walPath = config.walPath;
    const admin = config.admin || 'admin';
    const password = config.password || 'qwer1234';
    const CHANNEL = config.channel || 'mychannel';
    const CONTRACT_NAME = config.contract_name || 'fov';

    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const org = ccp.client.organization;
    const cert = ccp.organizations[org]['certificateAuthorities'];
    const msp = ccp.organizations[org]['mspid'];
    const caURL = ccp.certificateAuthorities[cert].url;
    const ca = new FabricCAServices(caURL);

    const wallet = await Wallets.newFileSystemWallet(walPath);
    const gateway = new Gateway();

    let fovConfig = {};

    fovConfig.wallet = wallet;
    fovConfig.gateway = gateway;
    fovConfig.connect = async (user) => {
        let contract;
        try{
            await gateway.connect(ccp, { wallet: wallet, identity: user, discovery: { enabled: true, asLocalhost: true } })
            const network = await gateway.getNetwork(CHANNEL);
            contract = network.getContract(CONTRACT_NAME);
        } catch (err) {
            console.log(err);
            throw err;
        }
        return contract;
    }

    fovConfig.disconnect = async () => {
        return await gateway.disconnect();
    }

    fovConfig.registUser = async function(user) {
        let identity;
        try{
            const userIdentity = await wallet.get(user);
            if (userIdentity) {
                return userIdentity;
            }
    
            let adminIdentity = await wallet.get(admin);
            if (!adminIdentity) {
                adminIdentity = await this.enrollAdmin();
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, admin);

            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: user,
                role: 'client'
            }, adminUser);
            const enrollment = await ca.enroll({
                enrollmentID: user,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: msp,
                type: 'X.509',
            };
            await wallet.put(user, x509Identity);
            console.log(`Successfully registered user ${user} and imported it into the wallet`);
            identity = x509Identity;
        } catch (err) {
            console.log(err);
            identity = null;
        }
        return identity;
    }

    fovConfig.enrollAdmin = async function() {
        let identity;
        try{
            const adminIdentity = await wallet.get(admin);
            if (adminIdentity) {
                try {
                    await fovConfig.connect();
                    fovConfig.disconnect();
                    return adminIdentity;
                } catch(err) {
                    console.log('ERROR : admin connect error');
                    console.log('Enroll Admin');
                }
            }
            const caInfo = ccp.certificateAuthorities[cert];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            const enrollment = await ca.enroll({ enrollmentID: admin, enrollmentSecret: password });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: msp,
                type: 'X.509',
            };
            await wallet.put(admin, x509Identity);
            identity = x509Identity;
        } catch (err) {
            console.log(err);
        }
        return identity;
    }

    return fovConfig;
});