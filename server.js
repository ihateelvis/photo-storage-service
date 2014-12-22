var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var morgan = require('morgan');
var bodyParser = require('body-parser');

var db = mongoose.connect('mongodb://127.0.0.1:27017/photoTest1');
//attach lister to connected event
mongoose.connection.once('connected', function() {
	console.log("Connected to database")
});

app.use(express['static'](__dirname + '/mockpage'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Creates photo DB object schema
var photoSchema = new Schema ({
	user_id: Number,
	loc: String,
	rel_id: Number,
	global_id: Number,
	date: Date,
	title: String,
	caption: String
});
var Photo = mongoose.model('Photo', photoSchema);

// Get single photo by id
app.get('/api/users/:user_id/photos/:photo_id', function(req, res) {
	if (req.params.user_id == 1 && req.params.photo_id == 1) {
		res.status(200).json({
			'message': 'You have hit the single photo GET API!'
		});
	} else {
		res.status(404).json({
			'message': 'Please provide a userId and photoId of 1!'
		});
	}
});

// Get multiple photos for single user
app.get('/api/users/:user_id/photos', function(req, res) {
	if (req.params.user_id != 1) {
		res.status(404).json({
			'message': 'Please provide a userId of 1!'
		});
		return;
	}

	Photo.findOne({'user_id': 1}, function(err, foundPhoto) {
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
		res.status(404).json({
			'message': 'Please provide a userId of 1!'
		});
		return;
	}

	var photo = new Photo({
		user_id: req.params.user_id,
		loc: './mockpage/photos/photo' + req.params.user_id,
		rel_id: 1,
		global_id: 1,
		date: new Date(),
		title: 'Photo 1',
		caption: 'This is a test photo'
	})
	photo.save();

	res.status(200).json({
		'message': 'You have created a new photo DB object using the POST API!'
	});
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
	res.send("./mockpage/index.html");
});

app.listen(3000);
console.log("App listening on port 8080");