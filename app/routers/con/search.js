
'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FovCon = require('../../lib/fov-con');

router.get('/', async (req, res) => {
    let key = req.query.key;
    let html;
    let tbody;
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
                <tr>
                    <th>${i+1}</th>
                    <td>${record['time']}</td>
                    <td>${record['date']}</td>
                    <td>${record['service']}</td>
                </tr>
                `;
            }
        }
    } catch (err) {
        console.log(err);
    }
    let content=`
    <table>
        <caption>봉사내역</caption>
        <thead>
            <tr>
                <th></th>
                <th>봉사 시간</th>
                <th>봉사 날짜</th>
                <th>봉사 기관</th>
            </tr>
        </thead>
        <tbody>
            ${tbody?tbody:'<td colspan="4">봉사내역이 없습니다.</td>'}
        </tbody>
    </table>`;
    let sendHtml = eval(`\`${html}\``);
    
    res.send(sendHtml);
    
});

module.exports = router;