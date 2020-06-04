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
            "email" : String,
            "organization" : String,
            "birth" : String,
            "job" : String
    },{
            versionKey:false
    });
userSchema.set('collection','con_organization');
var userModel = mongoose.model('con_organization',userSchema);
db.on('error',function(){
    console.log("Connection Failed");
});


router.route('/join').get(function(req,res){
    console.log('==========Make member =========');
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'con', 'join_page.html'));
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

async function checkUserId(user_id, func) {
    await userModel.findOne({"id": user_id },function(error,user){
        if(user != null){
            func(true);
        }
        else{
            func(false);
        }
    });
}

router.route('/dup_id').post(function (req,res){
    console.log('========check dup_email==========');
    var check_id=req.body.user_id;
    let check = true;
    checkUserId(check_id, function(check) {
        if(check){
            res.status(200).json({
                'check': true
            });
        }
        else{
            res.status(200).json({
                'check': false
            });
        }
    });
});

router.route('/make_member').post(function(req,res){
    console.log('========== Make_Member =========');
    var member_id=req.body.user_id;
    var member_email=req.body.user_email;
    var member_pass=req.body.user_psswd;
    var member_name=req.body.user_name;
    const member_org = req.body.user_company;
    const member_birth = req.body.user_birth;
    const member_job = req.body.user_job;


    checkUserId(member_id, function(check) {
        if (!check) {
            const save_data= new userModel({
                "id": member_id,
                "password":member_pass,
                "name":member_name,
                "email":member_email,
                "organization": member_org,
                "birth" : member_birth,
                "job" : member_job
            });
 
            console.log('id : '+member_id+' password : '+member_pass+' name : '+member_name+" email : "+member_email +' organization : '+member_org);
            console.log(member_birth + ' ' + member_job);
            
            save_data.save(function (err,save_data) {
                 if(err)
                    console.err(err);      
             });
            res.redirect('/loginpage');
        } else {
            res.redirect('/process/join');
        }
    });
}); 

router.route('/logout').post(function(req,res){
    if (req.session.key) {
    	console.log('====== LOGOUT ======');
    	req.session.destroy();
    	res.redirect('/');
    }
});

module.exports = router;
