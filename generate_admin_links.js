var mongoose = require('mongoose');
var Trip = require('./models/trip');
var fs = require('fs')

mongoose.connection.on('error', function(err) {
    console.error('MongoDB Error: %s', err);
});

mongoose.connect('mongodb://localhost/interim_designs_production');

Trip.find({}, function(err, trips) {
    if (err) {
        console.error("Error removing all existing trip records: " + err);
    } else if (trips) {
        var tripAdminLinks = []
        for (var i = 0; i < trips.length; i++) {
            tripAdminLinks.push(encodeURI("interim.bitwisehacks.com/listSubmissions.html?key=" + trips[i]._id + "&tripName=" + trips[i].name));
        }
        fs.writeFile('./admin_links.json', JSON.stringify(tripAdminLinks, null, 2) , 'utf-8');
    }
});
