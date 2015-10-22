var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tripSchema = new Schema({
  name: { type: String, unique: true, require: true },
  created_at: Date,
  updated_at: Date
});

tripSchema.pre('save', function(next) {
  var currentDate = new Date();

  this.updated_at = currentDate;

  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
