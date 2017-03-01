var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var User = require("../app/models/user");
var bcrypt = require('bcryptjs');

var configauth = require("./auth");
module.exports = function(passport){

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});


	passport.use('local-signup',new LocalStrategy({
		usernameField:'email',
		passwordField:'password',
		passReqToCallback:true
	},
	function(req,email,password,done){
		
		User.findOne({'local.username':email},function(err,user){
				if(err)
					return done(err);
				if(user){
					return done(null,false,req.flash("signupMessage","That email already taken"))
				}
				if(!req.user){
					var newuser = new User();
					newuser.local.username = email;
					newuser.local.password = password;
					bcrypt.genSalt(10, function(err, salt) {
					    bcrypt.hash(newuser.local.password, salt, function(err, hash) {
					    	
					        newuser.local.password = hash;
					        console.log(newuser,"newuser")
					        newuser.save(function(err,user){
								if(err) throw err;
								return done(null,newuser);
							})
					    });
					});
				}else{
					var newuser = req.user;
					console.log(newuser,"newuser")
					newuser.local.username = email;
					newuser.local.password = password;
					newuser.save(function(err){
	    				if(err)
	    					throw err;
	    				return done(null,newuser)

	    			})
				}
			})
		
	}

	))

	passport.use("local-login",new LocalStrategy({
		usernameField:'email',
		passwordField:'password',
		passReqToCallback:true
	},
	function(req,email,password,done){
		process.nextTick(function(){
			User.findOne({'local.username':email},function(err,user){	
				if(err)
					return done(err);
				if(!user)
					return done(null,false,req.flash("loginMessage","No user found"))
				
				bcrypt.compare(password, user.local.password, function(err, res) {
					
				   if(err) throw err;
			   		if(res){
			   			console.log(req.user,"req")
			   			return done(null, user);
			   		} else {
			   			return done(null, false, req.flash("loginMessage","Invalid password"));
			   		}
				});
			})
		})
	}
	))

	passport.use(new FacebookStrategy({
    	clientID: configauth.facebookAuth.clientId,
	    clientSecret: configauth.facebookAuth.clientSecret,
	    callbackURL:configauth.facebookAuth.callbackURL,
	    passReqToCallback:true
	  }, function(req,accessToken, refreshToken, profile, done) {
	    process.nextTick(function(){
	    	console.log(req.user,"req")
	    	if(!req.user){
	    	User.findOne({'facebook.id':profile.id},function(err,user){
	    		if(err)
	    			return done(err);
	    		if(user){
	    			return done(null,user)
	    		}
	    		else{
	    			console.log(profile)
	    			var newuser = new User();
	    			newuser.facebook.id = profile.id;
	    			newuser.facebook.token = accessToken;
	    			newuser.facebook.name = profile.displayName;
	    			//newuser.facebook.email = profile.emails[0].value;
	    			newuser.save(function(err){
	    				if(err)
	    					throw err;
	    				return done(null,newuser)

	    			})
	    		}
	    	})
	    }else{
	    	var newuser = req.user;
	    	console.log(newuser,"newuser")
	    			newuser.facebook.id = profile.id;
	    			newuser.facebook.token = accessToken;
	    			newuser.facebook.name = profile.displayName;
	    			//newuser.facebook.email = profile.emails[0].value;
	    			newuser.save(function(err){
	    				if(err)
	    					throw err;
	    				return done(null,newuser)

	    			})
	    }
	    })
	  }
	));

	passport.use(new GoogleStrategy({
    	clientID: configauth.googleAuth.clientId,
	    clientSecret: configauth.googleAuth.clientSecret,
	    callbackURL:configauth.googleAuth.callbackURL,
	    passReqToCallback:true
	  }, function(req,accessToken, refreshToken, profile, done) {
	    process.nextTick(function(){
	    	if(!req.user){
	    	User.findOne({'google.id':profile.id},function(err,user){
	    		if(err)
	    			return done(err);
	    		if(user){
	    			return done(null,user)
	    		}
	    		else{
	    			var newuser = new User();
	    			newuser.google.id = profile.id;
	    			newuser.google.token = accessToken;
	    			newuser.google.name = profile.displayName;
	    			newuser.google.email = profile.emails[0].value;
	    			newuser.save(function(err){
	    				if(err)
	    					throw err;
	    				return done(null,newuser)

	    			})
	    		}
	    	})
	    }else{
	    	var newuser = req.user;
	    			newuser.google.id = profile.id;
	    			newuser.google.token = accessToken;
	    			newuser.google.name = profile.displayName;
	    			newuser.google.email = profile.emails[0].value;
	    			newuser.save(function(err){
	    				if(err)
	    					throw err;
	    				return done(null,newuser)

	    			})
	    }
	    })
	  }
	));


}