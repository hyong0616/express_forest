'use strict';

const{Gateway, Wallets} = require('fabric-network');
const path = require('path');

const config = require('./config/config');

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var router1 = express.Router();
var server = app.listen(3001,function(){
        console.log("Express server has start")
        })

app.use('/static/',express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/',function(req,res){
        res.sendFile(__dirname + '/app/index.html');
        });

router1.route('/login').post(function(req,res){
    console.log('==========LOGIN START==========');
    var user_id = req.body.id;
    var user_pw = req.body.password;
    //user login check
    res.sendFile(__dirname+'/app/input.html')
})


var obj = {
    table : []
};

async function invoke_chain(student_name, vol_name, vol_date, vol_time) {
    console.log('==========INVOKE FUNC START==========');
try {
        // load the network configuration
        const ccpPath = path.resolve(config.path.FABRIC_NETWORK_PATH, 'organizations', 'peerOrganizations', 'vol1.example.com', 'connection-vol1.json');
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
        await contract.submitTransaction('createVolent', 'VOLENT12', vol_time, vol_date, vol_name, student_name);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}




router1.route('/save').post(function(req,res){
    console.log('==========SAVE START=========');
    var student_affli = req.body.student_affli;
    var student_name = req.body.student_name;
    var vol_name = req.body.vol_name;
    var vol_date = req.body.vol_date;
    var vol_time = req.body.vol_time;
    
    invoke_chain(student_name, vol_name,vol_date,vol_time);
   
    res.write('finish');
    res.end();
});

app.use('/process',router1);
