
'use strict';

const config = require('./config/config');

var express = require('express');
const path = require('path');

var app = express();

const FovCon = require('./lib/fov-con');
try {
    const fov = await FovCon('admin');
    await fov.enrollAdmin();
} catch(err) {
    console.log(err);
}

/*
 * Get Router
 */
const searchRouter = require('./routers/con/search');


/*
 * Express Middleware
 */
app.use('/static/',express.static(path.join(__dirname, '/views')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


/*
 * Use Router
 */
app.use('/', searchRouter);


var server = app.listen(3002,function(){
    console.log("Con1 server has start");
});