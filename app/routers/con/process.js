'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fov', {useNewUrlParser: true});
var db = mongoose.connection;
const Schema = mongoose.Schema;
const userSchema = new Schema({
            "id" : String,
            "password" : String,
            "name" : String,
            "organization" : String,
    },{
            versionKey:false
    });
userSchema.set('collection','con_organization');
var userModel = mongoose.model('con_organization',userSchema);
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
            res.redirect('/');
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

   var save_data= new userModel({"id": member_id,"password":member_pass,"name":member_name, "organization": "sample"});
 
   console.log('id:'+member_id+'password;'+member_pass+'name;'+member_name);
   
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
    	res.redirect('/');
    }
});

module.exports = router;
