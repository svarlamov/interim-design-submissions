var http = require('http');
var needle = require('needle');

module.exports = function(email, password, callback) {
    var data = {
        'Email': email,
        'password': password,
        'LinkID': '',
        'pageaction': 'Login'
    }
    needle.post('https://www.hkis.edu.hk/login/index.aspx', data, function(err, resp) {
        if (!err && resp.statusCode == 302) {
            callback(true);
        } else {
            console.log("An error occured posting login data: " + err + " with status code " + resp.statusCode);
            callback(false);
        }
    });
}
