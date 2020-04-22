'use strict';

const{Gateway, Wallets} = require('fabric-network');
const path = require('path');


var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var router1 = express.Router();
var server = app.listen(3001,function(){
        console.log("Express server has start")
        })

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





router1.route('/save').post(function(req,res){
    console.log('==========SAVE START=========');
    var student_affli = req.body.student_affli;
    var student_name = req.body.student_name;
    var vol_name = req.body.vol_name;
    var vol_date = req.body.vol_date;
    var vol_time = req.body.vol_time;
    fs.exists('record.json',function(exists){
        if(exists){
            fs.readFile('record.json',function readFileCallback(err,data){
                if(err){
                    console.log(err);
                }
                else{
                      obj = JSON.parse(data);
                      obj.table.push({Student_Afflication : student_affli,
                                      Student_Name : student_name,
                                      Volunteer_Afflication : vol_name,
                                      Activity_Date : vol_date,
                                      Activity_Time : vol_time});

                      var json = JSON.stringify(obj);
                      fs.writeFileSync('record.json',json);
                }
            });
        }
        else {
              obj.table.push({Student_Afflication : student_affli,
              Student_Name : student_name,
              Volunteer_Afflication : vol_name,
              Activity_Date : vol_date,
              Activity_Time : vol_time});

              var json = JSON.stringify(obj);
              fs.writeFileSync('record.json',json);
        }
    });
    res.write('finish');
    res.end();
});

app.use('/process',router1);
