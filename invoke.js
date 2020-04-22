/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('main start');
try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'fabric-network', 'organizations', 'peerOrganizations', 'vol1.example.com', 'connection-vol1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const volentPath = path.join(process.cwd(), 'volent');
  
//	await volent = new FileSystemWallet(volentPath);
	const volent = await Wallets.newFileSystemWallet(volentPath);
        console.log(`Volent path: ${volentPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await volent.get('admin');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the volent');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet: volent, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fov');//networt 이름 fov

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        await contract.submitTransaction('createVolent', 'VOLENT12', '100', '2020-04-19', 'MyTest', '32221414');
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
