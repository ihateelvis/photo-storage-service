var fs = require('fs');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');

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
	if (req.params.user_id == 1 && req.params.photo_id == 1) {
		res.setHeader('Content-type', 'image/jpg');
		var file = './testUploads/IMAG01571419370672847.jpg';
		fs.createReadStream(file, {encoding: "base64"}).pipe(res);
		/*res.status(200).json({
			'message': 'You have hit the single photo GET API!'
		});*/
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
		var photoMap = {};

		foundPhotos.forEach(function(photo) {
			photoMap[photo._id] = photo;
		});

		res.status(200).json({
			'message': 'You have hit the single-user multiple-photo GET API!'
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
	if (req.params.user_id != 1) {
		res.status(400).json({
			'message': 'Please provide a userId of 1!'
		});
		return;
	}

	if (uploadComplete == true) {
		uploadComplete = false;

		var oldName = req.files.userPhoto.originalname;
		var oldLocation = __dirname + '/testUploads/' + oldName;
		var newName = oldName.substring(0, oldName.indexOf('.' + req.files.userPhoto.extension)) + Date.now() + '.' + req.files.userPhoto.extension;
		var newLocation = __dirname + '/testUploads/' + req.params.user_id + '/' + newName;

		fs.rename(oldLocation, newLocation, function(error) {
				if(error) {
					res.send({
						error: 'There was an error saving your file! Please try again!'
					});
					//TODO: Add delete of original file in ./testUploads
					return;
				}

				var photo = new Photo({
					user_id: req.params.user_id,
					loc: newLocation,
					date: new Date(),
					title: 'Photo 1',
					caption: 'This is a test photo'
				})
				photo.save();

				res.status(200).json({
					'message': 'You have saved a new photo DB object using the POST API!'
				});
			}.bind(this)
		);
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
app.get('*', function(req, res) {
	res.send(process.argv[2]);
});

app.listen(3000);
console.log("App listening on port 3000");