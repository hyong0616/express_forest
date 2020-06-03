const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fov', {useNewUrlParser: true});

var db = mongoose.connection;
const Schema = mongoose.Schema;

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



router.get('/*', function(req, res) {
    console.log(req.url.substr(1));
    const user_id = req.url.substr(1);
    console.log(req.session.key);
    var pointcontent = '';
    if (req.session.key) {
        let key = req.query.key;
	let html;
	let tbody;

	//connect HTML    
	try{
            html = fs.readFileSync(path.join(__dirname, '..', '..', 'views','vol_page.html'), {encoding:'utf8'});
    	}
    	catch (err) {
            console.log(err);
            res.status(404).send('page not founded');
    	}
	
	//connect Database
	pointModel.findOne({"vol_name": req.session.key},function(error,user){
	
	    if (user!=null) {
	    	pointcontent = user.point;
	    	console.log(user);
	    }

	    else {
	    	pointcontent = `0`;
	    }
	    
	    console.log(pointcontent);
	}).then(function() {
	    
	    let content = `
		<h4>point: ${pointcontent}</h4>`;
	    let sendHtml = eval(`\`${html}\``);
	    res.send(sendHtml);
	    });

    }
    else {
        res.redirect('/');
    }
});


module.exports = router;
