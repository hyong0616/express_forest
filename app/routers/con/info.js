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
        "vol_id" : String,
        "point" : Number,
    },{
            versionKey:false
    });
pointSchema.set('collection','vol_point');
var pointModel = mongoose.model('vol_point',pointSchema);

const userModel = mongoose.model('con_organization');

router.get('/', async function(req, res) {
	var pointcontent = '';
	console.log(req.get('host'));
    if (req.session.key) {
		let html;
		let name = '';
		let birth = '';
		let job = '';
		let my_url = '';

		await userModel.findOne({id:req.session.key}, function(err, user) {
			if (user != null) {
				name = user.name;
				if (user.birth) {
					birth = user.birth;
				}
				if (user.job) {
					job = user.job;
				}
				my_url = req.get('host') + '/' + user.id;
			}
		});

	//connect HTML    
	try{
            html = fs.readFileSync(path.join(__dirname, '..', '..', 'views','vol_page.html'), {encoding:'utf8'});
    	}
    	catch (err) {
            console.log(err);
            res.status(404).send('page not founded');
    	}
	
	//connect Database
	pointModel.findOne({"vol_id": req.session.key},function(error,user){
	
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
        res.redirect('/loginpage');
    }
});


module.exports = router;
