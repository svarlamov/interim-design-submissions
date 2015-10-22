var mongoose = require('mongoose');
var Trip = require('./models/trip');

var trips = [
    "Cambodia: From Empire to Empathy",
    "Cambodia: Siem Reap Service",
    "China: Lost Heaven in South West China",
    "Fiji: The Spirit of Fiji",
    "Hong Kong: Artist for a Week",
    "Hong Kong: Blue Water Sailing",
    "Hong Kong: Hiking and Biking",
    "Hong Kong: Social Awareness",
    "India: Children of Kolkata",
    "India: At the Foothills of the Himalaya",
    "India: From Meenashki to Munnar (Arriving Madurai /departning Cochin)",
    "India: Teaching for Empowerment",
    "Indonesia: Telnunas Service Adventure",
    "Japan: Kansai No Tabi",
    "Japan: Trekking on the Nakasendo Trail",
    "Japan: Winter Mountaineering Outward Bound",
    "Laos: Culture in Action",
    "Mongolia: Service in Ulaanbaatar",
    "Nepal: Annapurna Pranam",
    "New Zealand: Eco Challenge",
    "New Zealand: Maori Legends",
    "New Zealand: North Island Adventure (Auckland)",
    "Phillipines: Borocay Service",
    "South Africa: Reconciliation and Resilience",
    "Sri Lanka: Outward Bound",
    "Sri Lanka: Service and Community Insight (Colombo)",
    "Taipei: Biking and Bubble Tea",
    "Tanzania: Culture and the Crater",
    "Thailand: Elephant Encounter",
    "Thailand: HFH: Chiang Mai",
    "Thailand: Masterchef",
    "Thailand: Medical Certification Program",
    "Thailand: Mind, Body and Soul (Phuket)",
    "Thailand: Pattaya Service",
    "Thailand: Ricefields Service Project",
    "Thailand: Advanced Scuba Diving ",
    "Thailand: Beginning Scuba Diving ",
    "Thailand: Yaowawit School Service",
    "Turkey: Crossroads of Cultures",
    "Vietnam: Northern Region Service",
    "Vietnam: Phu My Orphanage"
]

mongoose.connection.on('error', function(err) {
    console.error('MongoDB Error: %s', err);
});

mongoose.connect('mongodb://localhost/interim_designs_production');

Trip.remove({}, function(err) {
    if (err) {
        console.error("Error removing all existing trip records: " + err)
    }
});

for (var i = 0; i < trips.length; i++) {
    var t = new Trip({ name: trips[i] })
    t.save(function(err, result) {
        if (err) {
            console.error("Error saving an interim trip: " + err)
        }
    });
}
