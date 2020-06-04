
'use strict';

const config = require('./config/config');

var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();

const FovCon = require('./lib/fov-con');
(async () => {
    try {
        const fov = await FovCon('admin');
        await fov.enrollAdmin();
    } catch(err) {
        console.log(err);
    }
})();

/*
 * Redis
 *
 */
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379,'127.0.0.1', {db:1});
client.on("error",function(err){
    console.log("Error"+err);
});

/*
 * Get Router
 */
const searchRouter = require('./routers/con/search');
const loginRouter = require('./routers/con/login');
const processRouter = require('./routers/con/process');
const infoRouter = require('./routers/con/info');

/*
 * Express Middleware
 */
app.use('/static/',express.static(path.join(__dirname, '/views')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new redisStore({client: client,ttl : 260}),
    cookie:{maxAge:2592000000}
    })
);

/*
 * Use Router
 */
app.use('/loginpage', loginRouter);
app.use('/process', processRouter);
app.use('/info', infoRouter);
app.use('/', searchRouter);


var server = app.listen(3002,function(){
    console.log("Con1 server has start");
});