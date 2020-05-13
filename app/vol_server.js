'use_strict'

const{Gateway, Wallets} = require('fabric-network');
const path = require('path');
const config = require('./config/config');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var mongoose = require('mongoose');
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);

var app = express();
var router = express.Router();
mongoose.connect('mongodb://localhost:27017/fov', {useNewUrlParser: true});
var db = mongoose.connection;
var Schema = mongoose.Schema;
var userSchema = new Schema({
        "_id" : Schema.Types.ObjectId,
        "id" : String,
        "password" : String,
        "name" : String,
        "organization" : String,
});
userSchema.set('collection','vol_organization');
var userModel = mongoose.model('vol_organization',userSchema);
var server = app.listen(3001,function(){
        console.log("Express server has start")
        })
var client = redis.createClient(6379,'127.0.0.1');

db.on('error',function(){
        console.log("Connection Failed");
});

client.on("error",function(err){
        console.log("Error"+err);
});


app.use('/static/',express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new redisStore({client: client,ttl : 260}),
    cookie:{maxAge:2592000000}
    })
);

app.use('/process',router);
app.get('/',function(req,res){
        res.sendFile(__dirname + '/views/main.html');
	if (req.session.key)
		console.log('success session');
});


async function invoke_chain(student_name, vol_name, vol_date, vol_time) {
    console.log('==========INVOKE FUNC START==========');
try {
        // load the network configuration
        const ccpPath = path.resolve(config.path.FABRIC_NETWORK_PATH, 'organizations', 'peerOrganizations', 'vol1.example.com', 'connection-vol1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const volentPath = path.join(process.cwd(), 'volent');

//      await volent = new FileSystemWallet(volentPath);
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
        await contract.submitTransaction('createVolent', 'VOLENT12', vol_time, vol_date, vol_name, student_name);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

app.get('/loginpage',function(req,res){
	res.sendFile(__dirname+ '/views/login.html');
});

router.route('/login').post(function(req,res){
        console.log('==========LOGIN START==========');
        var user_id = req.body.login_email;
        var user_pw = req.body.login_passwd;
	//user login check
        userModel.findOne({"id": user_id,"password": user_pw},function(error,user){

		if (user!=null){
			req.session.key = user_id;
			res.sendFile(__dirname+ '/views/input.html');
		}

		else{
                        console.log("아이디나 비밀번호가 존재하지 않습니다.");
                        res.redirect('/loginpage');
                }
        });

        //user session set
});

router.route('/logout').post(function(req,res){
	console.log('====== LOGOUT ======');
	req.session.destroy();
	res.redirect('/');
});

router.route('/save').post(function(req,res){
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

app.use('/process',router);

