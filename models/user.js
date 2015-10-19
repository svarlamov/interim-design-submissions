var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Session = require('./session');
var hkis = require('../auth/hkis');

var userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  auth_provider: { type: String, require: true },
  created_at: Date,
  updated_at: Date
});

userSchema.pre('save', function(next) {
  var currentDate = new Date();

  this.updated_at = currentDate;

  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

userSchema.methods.authenticate = function authUser(email, password, callback) {
    user = this
    hkis(email, password, function(ok) {
        if (ok) {
            var session = new Session({ user: user });
            session.save();
            callback(null, session);
        } else {
            callback(null, null);
        }
    });
};

userSchema.methods.isLoggedIn = function checkLoggedIn(){
    // TODO: Check that the user is logged in
    return true;
}

var User = mongoose.model('User', userSchema);

module.exports = User;
