var fs = require('fs');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var Q = require('q');
var path = require('path');

var uploadComplete = false;

var db = mongoose.connect('mongodb://127.0.0.1:27017/photoTest2');
//attach lister to connected event
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('connected', function() {
	console.log("Connected to database")
});

app.use(express['static'](__dirname + '/mockpage'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(multer({dest: './testUploads',
	rename: function(fieldname, filename) {
		return filename;
	},
	onFileUploadStart: function(file) {
		console.log(file.originalname + ' upload is starting...');
	},
	onFileUploadComplete: function(file) {
		console.log(file.fieldname + ' uploaded to ' + file.path);
		uploadComplete = true;
	}
}));

// Creates photo DB object schema
var photoSchema = new Schema({
	user_id: Number,
	loc: String,
	date: Date,
	title: String,
	caption: String
});
var Photo = mongoose.model('Photo', photoSchema);

// Get single photo by id
app.get('/api/users/:user_id/photos/:photo_id', function(req, res) {
	if (req.params.user_id == 1) {
		res.setHeader('Content-type', 'image/jpg');
		var file;
		var promise = Photo.find({'user_id': req.params.user_id}).find({_id:mongoose.Types.ObjectId(req.params.photo_id)}).exec(function(err, foundPhotos){
			if (foundPhotos[0]) {
				file = foundPhotos[0].loc;
				fs.readFile(file, "base64", function(err, data){
					res.json({
						photo: data,
						title: foundPhotos[0].title,
						caption: foundPhotos[0].caption
					});
				});
			} else {
				res.status(400).json({
					message: 'Photo not found!'
				});
			}
		});
	} else {
		res.sendStatus(400);
	}
});

// Get multiple photos for single user
app.get('/api/users/:user_id/photos', function(req, res) {
	if (req.params.user_id != 1) {
		res.status(400).json({
			'message': 'Please provide a userId of 1!'
		});
		return;
	}

	Photo.find({'user_id': req.params.user_id}).sort({"updatedAt": 1}).exec(function(err, foundPhotos) {
		var photoArray = [],
			deferreds = [];

		foundPhotos.forEach(function(photo, index) {
			deferreds.push(Q.defer());
			fs.readFile(photo.loc, "base64", function(err, data) {
				if(err) {
					deferreds[index].resolve();
				} else {
					photoArray[index] = {
						photo: data,
						title: photo.title,
						caption: photo.caption
					};
					deferreds[index].resolve();
				}
			});
		});
		Q.spread(deferreds.map(function(deferred){return deferred.promise}), function() {
			res.json(photoArray);
		});
	});
});

// Get multiple photos for multiple users
app.get('/api/photos', function(req, res) {
	res.status(200).json({
		'message': 'You have hit the multiple-user multiple-photo GET API'
	});
});

// Post a new photo on behalf of a particular user
app.post('/api/users/:user_id/photos', function(req, res) {
	if (uploadComplete == true) {
		uploadComplete = false;

		var oldName = req.files.userPhoto.originalname;
		var oldLocation = __dirname + '/testUploads/' + oldName;
		var newName = oldName.substring(0, oldName.indexOf('.' + req.files.userPhoto.extension)) + Date.now() + '.' + req.files.userPhoto.extension;
		var newLocation = __dirname + '/testUploads/' + req.params.user_id + '/' + newName;

		if (req.params.user_id != 1) {
			res.status(400).json({
				'message': 'Please provide a userId of 1!'
			});
		} else if (!req.body || !req.body.photoTitle || !req.body.photoCaption) {
			res.status(400).json({
				'message': 'Please provide both a photoTitle and photoCaption in the body!'
			});
		} else { 
			fs.rename(oldLocation, newLocation, function(error) {
				if(error) {
					res.send({
						error: 'There was an error saving your file! Please try again!'
					});
				} else {
					var photo = new Photo({
						user_id: req.params.user_id,
						loc: newLocation,
						date: new Date(),
						title: req.body.photoTitle,
						caption: req.body.photoCaption
					});
					photo.save();

					res.status(200).json({
						'message': 'You have saved a new photo DB object using the POST API!',
						'photo_id': photo._id
					});
				}
			}.bind(this));
		}

		fs.exists(oldLocation, function(exists) {
    	if (exists) {
        fs.unlink(oldLocation, function(error) {
        	// Do nothing
        });
    	}
		});
	}
});

// Update information of a particular photo
app.put('/api/users/:user_id/photos/:photo_id', function(req, res) {
	res.status(200).json({
		'message': 'You have hit the one and only PUT API!'
	});
});

// Delete a particular photo associated with a user
app['delete']('/api/users/:user_id/photos/:photo_id', function(req, res) {
	res.status(200).json({
		'message': 'You have hit the one and only DELETE API!'
	});
});

// Get home page
app.get('/app/', function(req, res) {
	res.sendFile(path.normalize(__dirname + '/' + process.argv[2] + "app/index.html"));
});

app.get('*', function(req, res) {
	res.sendFile(path.normalize(__dirname + '/' + process.argv[2] + req.params[0]));
});

app.listen(3000);
console.log("App listening on port 3000");