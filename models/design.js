var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../config');
var useS3 = config.s3_enabled;
var Trip = require('./trip');
if(useS3) {
  var AWS = require('aws-sdk');
  AWS.config = new AWS.Config();
  AWS.config.accessKeyId = config.s3.key;
  AWS.config.secretAccessKey = config.s3.secret;
  var s3 = new AWS.S3();
  var BUCKET_NAME = config.s3.bucket;
}
var Schema = mongoose.Schema;

var designSchema = new Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.ObjectId, ref: 'Trip', required: true },
  description: { type: String, required: true},
  files: [{ type: String, required: true }],
  s3: { type: Boolean, required: true },
  created_at: Date,
  updated_at: Date
});

designSchema.pre('save', function(next) {
  var currentDate = new Date();

  this.updated_at = currentDate;

  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

designSchema.pre('remove', function(next) {
  if(useS3) {
    var params = {
      Bucket: BUCKET_NAME,
      Key: this.file
    };
    s3.deleteObject(params, function(err, data) {
      if (err) {
        console.error(err); // an error occurred
      }
      else {
        console.log(data); // successful response
      }
    });
  } else {
    // Delete the file, because since the answer is gone the file is unreferenced
    var p = __dirname.replace('models', '') + 'uploads/' + this.file;
    fs.exists(p, function(exists) {
        if(exists) {
            fs.unlink(p);
            console.log("File with path, " + __dirname.replace('models', '') + 'uploads/' + this.file + ", has been removed");
            next();
        } else {
            next();
        }
    });
  }
});

var Design = mongoose.model('Design', designSchema);

module.exports = Design;
