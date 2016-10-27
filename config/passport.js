 // config/passport.js

// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {
	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.get(id, function(err, user) {
			if (err) return next(err);
			done(err, user);
		});
	});

	
	// =========================================================================
	// FACEBOOK ================================================================
	// =========================================================================
	passport.use(new FacebookStrategy({
		clientID        : configAuth.facebookAuth.clientID,
		clientSecret    : configAuth.facebookAuth.clientSecret,
		callbackURL     : configAuth.facebookAuth.callbackURL,
		profileFields: ['email', 'name'],
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, token, refreshToken, profile, done) {
		// asynchronous
		process.nextTick(function() {
			// check if the user is already logged in
			if (!req.user) {
				User.getBy('user.facebookId', profile.id, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						// if there is a user id already but no token (user was linked at one point and then removed)
						if (!user.facebookToken) {
							var update = {};
								update.id = user._id;
								update.props = {};
									update.props.facebookToken = token;
									update.props.facebookName  = profile.name.givenName + ' ' + profile.name.familyName;
									update.props.facebookEmail = profile.emails[0].value;
							User.update(update, function(err, user) {
								if (err)
									throw err;
								return done(null, user);
							});
						}

						return done(null, user); // user found, return that user
					} else {
						// if there is no user, create them
						var newUser = {};
							newUser.facebookId    = profile.id;
							newUser.facebookToken = token;
							newUser.facebookName  = profile.name.givenName + ' ' + profile.name.familyName;
							newUser.facebookEmail = profile.emails[0].value;

						User.create(newUser, function (err, user) {
							if (err)
								return next(err);
							return done(null, user);
						});
					}
				});
			} else {
                // user already exists and is logged in, we have to link accounts
                // but check if that facebook is linked already
                User.getBy('user.facebookId', profile.id, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						return done(null, user);
					} else {
						var updateUser = {};
							updateUser.id = req.user._id;
							updateUser.props = {};
								updateUser.props.facebookId    = profile.id;
								updateUser.props.facebookToken = token;
								updateUser.props.facebookName  = profile.name.givenName + ' ' + profile.name.familyName;
								updateUser.props.facebookEmail = profile.emails[0].value;

						User.update(updateUser, function(err, user) {
							if (err)
								throw err;
							return done(null, user);
						});
					}
				});
			}
		});
	}));
};