var express = require('express');
var router = express.Router();
var Trip = require('../models/trip');

/* GET all trips */
router.get('/', function(req, res, next) {
    Trip.find({}).exec(function(err, trips) {
        if (err) {
            console.error(err);
            res.send(err);
            return;
        }
        res.json(trips);
    });
});

module.exports = router;
