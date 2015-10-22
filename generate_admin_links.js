var mongoose = require('mongoose');
var Trip = require('./models/trip');

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
            tripAdminLinks.push(encodeURI("interim.bitwisehacks.com/listSubmissions.html?key=" + trip._id + "&tripName=" + trip.name));
        }
        fs.writeFile('./admin_links.json', JSON.stringify(obj, null, 2) , 'utf-8');
    }
});