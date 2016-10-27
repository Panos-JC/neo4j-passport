var User = require('../models/user');

module.exports = function(app, passport) {

	const failure = {
		"status": "Autenticação falhou!" 
	};

	const deslogado = {
		"status": "Deslogado!" 
	};

	// PROFILE SECTION =========================
	app.get('/profile', function(req, res) {
				res.json(req.user);
	});

	app.get('/failure', function(req, res) {
		res.json(failure);
	});

	app.get('/desligado', function(req, res) {
		res.json(deslogado);
	});
// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/failure',
				failureFlash : true // allow flash messages
			}));

		app.get('/logout', function(req, res){
 			req.logout();
  			res.json('/desligado');
		});

}