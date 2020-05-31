const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/*', function(req, res) {
    console.log(req.url.substr(1));
    const user_id = req.url.substr(1);
    console.log(req.session.key);
    if (req.session.key) {
        res.sendFile(path.join(__dirname, '..', '..', 'views', 'vol_page.html'));
    }
    else {
        res.redirect('/');
    }
});


module.exports = router;