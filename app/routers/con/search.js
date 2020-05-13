
'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FovCon = require('../../lib/fov-con');

router.get('/', async (req, res) => {
    let key = req.query.key;
    let html;
    let content='';
    try{
        html = fs.readFileSync(path.join(__dirname, '..', '..', 'views', 'con', 'search.html'), {encoding:'utf8'});
    }
    catch (err) {
        console.log(err);
        res.status(404).send('page not founded');
    }
    try{
        const fovcon = await FovCon('admin');
        if (key) {
            console.log(key);
            content = await fovcon.getVolentByUser(key);
        }
    } catch (err) {
        console.log(err);
    }
    let sendHtml = eval(`\`${html}\``);
    res.send(sendHtml);
    
});

module.exports = router;