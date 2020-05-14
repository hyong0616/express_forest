'use strict'

var express = require('express');
var app = express();

app.use('/static/',express.static(__dirname + '/views'));

app.get('/',function(req,res){
    res.sendFile(__dirname + '/views/main.html');
});


app.listen(3000,function(){
    console.log("Express server has start");
})