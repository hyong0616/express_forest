'use strict'

const express = require('express');
const router = express.Router();

const{Gateway, Wallets} = require('fabric-network');
const path = require('path');
const config = require('../../config/config');
const FovVol = require('../../lib/fov-vol');
var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fov', {useNewUrlParser: true});

var db = mongoose.connection;
const Schema = mongoose.Schema;

/*
 * user 정보 schema
 */
const userSchema = new Schema({
            "id" : String,
            "password" : String,
            "name" : String,
            "organization" : String,
    },{
            versionKey:false
    });
userSchema.set('collection','vol_organization');
var userModel = mongoose.model('vol_organization',userSchema);

/*
 * point 정보 schema
 */
const pointSchema = new Schema({
        "vol_name" : String,
        "point" : Number,
    },{
            versionKey:false
    });
pointSchema.set('collection','vol_point');
var pointModel = mongoose.model('vol_point',pointSchema);



db.on('error',function(){
    console.log("Connection Failed");
});

router.route('/join').post(function(req,res){
    console.log('==========Make member =========');
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'join_page.html'));
 
  });

router.route('/login').post(function(req,res){
    console.log('==========LOGIN START==========');
    var user_id = req.body.login_email;
    var user_pw = req.body.login_passwd;
//user login check
    userModel.findOne({"id": user_id,"password": user_pw},function(error,user){

        if (user!=null){
            req.session.key = user_id;
            res.sendFile(path.join(__dirname, '..', '..', 'views', 'input.html'));
        }

        else{
            user_pw = '비밀번호가 틀렸습니다.'
            console.log("아이디나 비밀번호가 존재하지 않습니다.");
            res.redirect('/loginpage');
        }
    });

    //user session set
});

router.route('/dup_email').post(function (req,res){
    console.log('========check dup_email==========');
    var check_email=req.body.user_email;

    userModel.findOne({"id": check_email },function(error,user){
        if(user != null){
        
        }
        else{

        }
    });  
});

router.route('/make_member').post(function(req,res){
    console.log('========== Make_Member =========');
    var member_id=req.body.user_email;
    var member_pass=req.body.user_psswd;
    var member_name=req.body.user_name;
    var member_organ=req.body.user_company;

   var save_data= new userModel({"id": member_id,"password":member_pass,"name":member_name, "organization": member_organ});
 
   console.log('id : '+member_id+' password : '+member_pass+' name : '+member_name+' organization : '+member_organ);
   
   save_data.save(function (err,save_data) {
        if(err)
           console.err(err);      
    });
   res.redirect('/loginpage');
   
}); 

router.route('/logout').post(function(req,res){
    if (req.session.key) {
    	console.log('====== LOGOUT ======');
    	req.session.destroy();
    	res.redirect('http://localhost:3000');
    }
});

router.route('/save').post(async function(req,res){
    if (req.session.key) {
	console.log('==========SAVE START=========');
    var student_affli = req.body.student_affli; //학생 기관
    var student_id = req.body.student_id; //학생 ID
    var vol_name = req.body.vol_name; //봉사 기관 명
    var vol_date = req.body.vol_date; //봉사 날짜
    var vol_time = req.body.vol_time; //봉사시간
    var time = Number(vol_time);
    // invoke_chain(student_name, vol_name,vol_date,vol_time);

    try {
        const fovvol = await FovVol('admin');
        await fovvol.invokeChain(vol_time, vol_date, vol_name, student_id);
    } catch (err) {
        console.log(err);
    }


    /*
     * point db에 저장
     */
    pointModel.findOne({"vol_name": vol_name},function(error,user){

        if (user!=null){
            pointModel.update({"vol_name":vol_name},{$inc:{point: +time} });
        }

        else{
            var save_data= new pointModel({"vol_name": vol_name, "point": time});

            save_data.save(function (err,save_data) {
            if(err)
               console.err(err);
             });

        }
    });
	

    res.redirect('http://localhost:3001');
    }
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
        await contract.submitTransaction('createVolent', 'VOLENT', vol_time, vol_date, vol_name, student_name);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
module.exports = router;
