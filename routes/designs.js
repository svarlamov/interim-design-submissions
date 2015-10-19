var express = require('express');
var config = require('../config');
var useS3 = config.s3_enabled;
if(useS3) {
  var AWS = require('aws-sdk');
  AWS.config = new AWS.Config();
  AWS.config.accessKeyId = config.s3.key;
  AWS.config.secretAccessKey = config.s3.secret;
  var s3 = new AWS.S3();
  var BUCKET_NAME = config.s3.bucket;
  createBucket(BUCKET_NAME);
}
var fs = require('fs');
var uuid = require('uuid');
var gm = require('gm');
var Design = require('../models/design');
var User = require('../models/user');
var Trip = require('../models/trip');
var router = express.Router({mergeParams : true});

var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

/* GET all designs */
router.get('/', function(req, res, next) {
    // TODO: Do not allow a full index on this field, require the interim key,
    //       and then present the designs for that interim
    Design.find({}).populate('user').exec(function(err, designs) {
        if (err) {
            console.error(err);
            res.send(err);
            return;
        }
        res.json(designs);
    });
});

/* POST submit a new design */
router.post('/', function(req, res, next) {
    if (req.body.description === undefined || req.body.description.length < 1) {
        res.json({ success: false, message: "Missing `description` parameter" });
        return
    }
    if (req.body.rand === undefined) {
        res.json({ success: false, message: 'Missing `rand` parameter.'});
        return
    } else {
        req.body.rand = String(req.body.rand)
    }
    if (req.body.trip == undefined || req.body.trip.length < 1) {
        res.json({ success: false, message: "Missing `trip` parameter" });
        return;
    }
    fs.readdir(__dirname.replace('routes', '') + 'uploads/' + req.body.rand, function(err, files) {
        if (files === undefined) {
            // TODO: Notify that no files were attached
            res.redirect('back')
            return
        }
        if (files.length < 1) {
            res.status(400);
            res.send("You must upload at least one valid file");
            return;
        }
        for (var i = 0; i < files.length; i++) {
            if (useS3) {
                uploadFileToS3(files[i], __dirname.replace('routes', '') + 'uploads/' + req.body.rand + '/' + files[i], function() {
                    fs.unlink(__dirname.replace('routes', '') + 'uploads/' + design.file);
                });
            } else {
                var source = fs.createReadStream(__dirname.replace('routes', '') + 'uploads/' + req.body.rand + '/' + files[i]);
                var dest = fs.createWriteStream(__dirname.replace('routes', '') + 'uploads/' + files[i]);

                source.pipe(dest);
                source.on('end', function() { console.log("Successfully copied file") });
                source.on('error', function(err) { throw err });
            }
        }
        Trip.findOne({ name: req.body.trip }).exec(function(err, t) {
            if (err) {
                res.json({ success: false, message: "Invalid `trip` parameter" });
                return;
            }
            if (t) {
                var design = new Design({ user: req.currentUser, trip: t, description: req.body.description, files: files, s3: useS3 });
                design.save(function(err, obj) {
                    if (err) {
                        res.json({ success: false, message: "An error occured saving your design" });
                        console.log(err);
                        return;
                    } else {
                        // TODO: Send to the view my submissions page?
                        res.redirect('back');
                        return;
                    }
                });
            } else {
                res.json({ success: false, message: "Invalid `trip` parameter" });
                return;
            }
        });

    });
});

/* POST submit a new design file */
router.post('/upload', function(req, res, next) {
    if (req.query.rand === undefined) {
        res.json({ success: false, message: 'Invalid `rand` query parameter.'})
    } else {
        req.query.rand = String(req.query.rand)
    }
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        var fn = uuid.v4();
        var extension = "";
        if(filename.indexOf(".") != -1) {
            extension = filename.substr(filename.lastIndexOf('.'));
        }
        mkdirSync(__dirname.replace('routes', '') + 'uploads/' + req.query.rand)
        fstream = fs.createWriteStream(__dirname.replace('routes', '') + 'uploads/' + req.query.rand + '/' + fn + extension);
        file.pipe(fstream);
        fstream.on('close', function () {
            gm(__dirname.replace('routes', '') + 'uploads/' + req.query.rand + '/' + fn + extension).size(function(err, value) {
                if (err) {
                    if (err.message.indexOf('No decode delegate') > -1){
                        res.status(400);
                        res.send("Upload failed. Could not recognise file.");
                        fs.unlink(__dirname.replace('routes', '') + 'uploads/' + req.query.rand + '/' + fn + extension);
                        return;
                    } else {
                        console.log(err)
                        res.status(500);
                        res.send("There was an error processing your file")
                        fs.unlink(__dirname.replace('routes', '') + 'uploads/' + req.query.rand + '/' + fn + extension);
                        return
                    }
                }
                if (value.width === undefined || value.width === undefined) {
                    res.status(400);
                    res.send("Upload failed. Could not recognise file.");
                    fs.unlink(__dirname.replace('routes', '') + 'uploads/' + req.query.rand + '/' + fn + extension);
                    return;
                }
                if (value.width > 200 && value.height > 200) {
                    res.redirect('back');
                    return;
                } else {
                    res.status(400);
                    res.send('The image must be at least 200px by 200px');
                    fs.unlink(__dirname.replace('routes', '') + 'uploads/' + req.query.rand + '/' + fn + extension);
                    return;
                }
            });
        });
    });
});

/* GET a user's design */
router.get('/mine', function(req, res, next) {
    Design.find({ user: req.currentUser }).populate('user').exec(function(err, design) {
        if (err) {
            console.error(err);
            res.send(err)
            return
        }
        if (design) {
            res.json(design)
        } else {
            res.json({ success: false, message: "Your Design Could Not be Found"})
        }
    });
});

/* GET a design */
router.get('/:design_id', function(req, res, next) {
    Design.find({ _id: req.params.design_id }).populate('user').exec(function(err, design) {
        if (err) {
            console.error(err);
            res.send(err)
            return
        }
        if (design) {
            res.json(design)
        } else {
            res.json({ success: false, message: "Could not find design " + req.params.design_id })
        }
    });
});

/* GET a file */
router.get('/:design_id/:file_name', function(req, res, next) {
    Design.findById(req.params.design_id).exec(function(err, design) {
        if(err) {
            console.error(err);
            res.send(err);
        } else if(design) {
          if(design.s3){
            // TODO: redir to aws signed url for file
            res.redirect('https://' + BUCKET_NAME + '.s3.amazonaws.com/' + req.params.file_name);
          } else {
            res.sendFile(__dirname.replace('routes', '') + 'uploads/' + req.params.file_name);
          }
        } else {
            res.status(404);
            res.json({ ok: false, reason: 'Invalid Design Id' });
        }
    });
});

function uploadFileToS3(remoteFilename, fileName, callback) {
  var fileBuffer = fs.readFileSync(fileName);
  var metaData = getContentTypeByFile(fileName);

  s3.putObject({
    ACL: 'public-read',
    Bucket: BUCKET_NAME,
    Key: remoteFilename,
    Body: fileBuffer,
    ContentType: metaData
  }, function(error, response) {
    console.log('uploaded file[' + fileName + '] to [' + remoteFilename + '] as [' + metaData + ']');
    console.log(arguments);
    callback(error, response);
  });
}


function getContentTypeByFile(fileName) {
  var rc = 'application/octet-stream';
  var fileNameLowerCase = fileName.toLowerCase();

  if (fileNameLowerCase.indexOf('.wav') >= 0) rc = 'audio/wav';
  else if (fileNameLowerCase.indexOf('.ogg') >= 0) rc = 'audio/ogg';
  else if (fileNameLowerCase.indexOf('.webm') >= 0) rc = 'video/webm';
  else if (fileNameLowerCase.indexOf('.mp4') >= 0) rc = 'video/mp4';
  else if (fileNameLowerCase.indexOf('.jpg') >= 0) rc = 'image/jpeg';
  else if (fileNameLowerCase.indexOf('.jpeg') >= 0) rc = 'image/jpeg';
  else if (fileNameLowerCase.indexOf('.gif') >= 0) rc = 'image/gif';
  else if (fileNameLowerCase.indexOf('.bmp') >= 0) rc = 'image/bmp';
  else if (fileNameLowerCase.indexOf('.png') >= 0) rc = 'image/png';

  return rc;
}


function createBucket(bucketName) {
  s3.createBucket({Bucket: bucketName}, function() {
    console.log('created the bucket[' + bucketName + ']');
  });
}

module.exports = router;
