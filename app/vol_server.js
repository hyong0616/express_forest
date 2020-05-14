'use_strict'


var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

/*
 * Redis
 *
 */
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379,'127.0.0.1');

client.on("error",function(err){
    console.log("Error"+err);
});

/*
 * 서버 MiddleWare 세팅
 * 
 */
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

/*
 * Router
 * 
 */
var processRouter = require('./routers/vol/process');
const loginRouter = require('./routers/vol/login');

app.use('/process', processRouter);
app.use('/loginpage', loginRouter);

app.get('/',function(req,res){
        res.redirect('/loginpage');
	if (req.session.key)
		console.log('success session');
});


app.listen(3001,function(){
    console.log("Express server has start")
});

