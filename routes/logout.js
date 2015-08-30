var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Session = require('../models/session');

/* POST log the user out */
router.post('/', function(req, res, next) {
    if(!req.currentUser || !req.sessionId) {
        res.status(400);
        res.send('You must be logged in, to log out');
        return;
    }
    Session.findById(req.sessionId, function(err, session) {
        if(err) {
            console.error(err);
            res.status(500);
            res.send(err);
        } else if(session) {
            session.remove();
            res.redirect('/login.html');
        } else {
            res.status(404);
            res.send('The session ID provided could not be found');
        }
    });
});

/* GET log the user out from a browser */
router.get('/', function(req, res, next) {
    if(!req.currentUser || !req.sessionId) {
        res.status(400);
        res.send('You must be logged in, to log out');
        return;
    }
    Session.findById(req.sessionId, function(err, session) {
        if(err) {
            console.error(err);
            res.status(500);
            res.send(err);
        } else if(session) {
            session.remove();
            res.clearCookie('session');
            res.clearCookie('username');
            res.redirect('/login.html');
        } else {
            res.status(404);
            res.clearCookie('session');
            res.clearCookie('username');
            res.send('The session ID provided could not be found. You may already be logged out.');
        }
    });
});

module.exports = router;
