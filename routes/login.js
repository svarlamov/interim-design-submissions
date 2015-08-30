var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Session = require('../models/session');

/* POST log the user in */
router.post('/', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    if(!email || !password) {
        res.status(401);
        res.send(JSON.stringify({ auth: false, message: 'You must provide both an email and password in the body of the request' }));
        return;
    }
    User.findOne({ email: email }, 'email auth_provider', function(err, user) {
        if (err) {
            console.log("error");
            console.error(err);
            res.send(err);
        } else {
            if(!user) {
                // Create a new user
                var newUser = new User({ email: email, auth_provider: 'hkis'});
                newUser.authenticate(email, password, function(err, session){
                    if (err) {
                        console.error(err);
                        res.send(err);
                    } else {
                        if (!session){
                            // The user is unauthorized
                            res.status(401);
                            res.redirect('back')
                        } else {
                            // Authentication Succeeded
                            // Save the user, since we know he's legit
                            newUser.save();
                            res.cookie('session', session._id, { maxAge: 900000, httpOnly: false });
                            res.cookie('username', session.user.email, { maxAge: 900000, httpOnly: false });
                            res.redirect('/index.html')
                        }
                    }
                });
            } else {
                //log in an existing user
                user.authenticate(email, password, function(err, session){
                    if (err) {
                        console.error(err);
                        res.send(err);
                    } else {
                        if (!session){
                            // The user is unauthorized
                            res.status(401);
                            res.redirect('back');
                        } else {
                            // Authentication Succeeded
                            res.cookie('session', session._id, { maxAge: 900000, httpOnly: false });
                            res.cookie('username', session.user.email, { maxAge: 900000, httpOnly: false });
                            res.redirect('/index.html')
                        }
                    }
                });
            }
        }
    });
});

module.exports = router;
