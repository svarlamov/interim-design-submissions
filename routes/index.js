var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.cookies.session) {
        console.log(req.cookies.session);
        res.sendFile('../public/index.html');
    } else {
        res.sendFile('../public/login.html');
    }
});

module.exports = router;
