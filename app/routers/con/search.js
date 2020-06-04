
'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FovCon = require('../../lib/fov-con');

router.get('/*', async (req, res) => {
    if (req.url.substr(1).match(/\./) != null) {
        return;
    }
    console.log(req.url.substr(1));
    let key = req.url.substr(1);
    console.log(key);
    let html;
    let tbody = '';
    if (key.length == 0) {
        try {
            html = fs.readFileSync(path.join(__dirname, '..', '..', 'views', 'con', 'search.html'), {encoding:'utf8'});
        } catch (err) {
            res.status(404).send('page not found');
            return;
        }
    }
    else if (req.query.key) {
        res.redirect('/' + req.query.key);
        return;
    }
    else {
        try{
            html = fs.readFileSync(path.join(__dirname, '..', '..', 'views', 'send_url.html'), {encoding:'utf8'});
        }
        catch (err) {
            console.log(err);
            res.status(404).send('page not founded');
        }
        try{
            const fovcon = await FovCon('admin');
            if (key) {
                console.log(key);
                let str = '';
                if (key === 'all') {
                    str = await fovcon.getAllVolents();
                }
                else {
                    str = await fovcon.getVolentByUser(key);
                }
                const data = JSON.parse(str);
                tbody = '';
                for (let i=0; i<data.length;i++) {
                    let record = data[i]['Record'];
                    tbody += `
                    <div class="news-slider__item swiper-slide">
                    <a href="#" class="news__item">
                        <div class="news-date">
                        <span class="news-date__title">${i+1}</span>
                        <span class="news-date__txt">봉사활동 기간 : ${record['date']}</span><br>
                        <span class="news-data__txt">총 봉사활동 시간 : ${record['time']}</span>
                        </div>
                        <div class="news__title">
                        봉사활동 기관 : ${record['service']}
                        </div>
                    </a>
                    </div>
                    `;
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    let content=`
    ${tbody}
    `;
    let sendHtml = eval(`\`${html}\``);
    
    res.send(sendHtml);
    
});

module.exports = router;