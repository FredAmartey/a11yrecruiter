const express = require("express");
const  router = express.Router({mergeParams: true});
const passport = require("passport");
const User  = require("../models/user");
// const Job = require("../models/jobs");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
// require('dotenv').config();

//index/root routes
router.get("/", function(req, res){
    res.render("index", {page: "A11yRecruiter | Home"});
});

router.get("/profile", function(req, res) {
    res.render('profile', {user: req.user });
});

//AUTH ROUTES
router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: '/jobs',
        failureRedirect: '/' }));

// show login form
router.get("/login", function(req, res){
    res.render("login", {page: "Login/SignUp"});
});

// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/jobs",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
});

//handle sign up logic
router.post("/register", function(req, res){
    let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.email,
        // resetPasswordToken: User.resetPasswordToken,
        // resetPasswordExpires: User.resetPasswordExpires
    });
    console.log(newUser.firstName);
    User.register(newUser, req.body.password, function(err, user){
        if(err){
          console.log(err);
        //  return res.render("login", {"error": err.message});
        req.flash("error", "The email you entered is already associated with another account");
        res.redirect("/login");
            // // req.flash("error", "The email you entered is already associated with an account");
            // return res.render("login", {message: req.flash('error', 'The email you entered is already associated with an account')});
        }
        passport.authenticate("local")(req, res, function(){
            // req.flash("success", "Welcome " + user.firstName);
            // req.flash("success", "Welcome " + user.google.firstName);
            res.redirect("/jobs");
            // res.render('profile', { user: req.user });

        });
    });
});



//logout route
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/");
});


/*
 forgot route
 GET route - renders the forgot template
 POST route -
*/
// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({username: req.body.email }, function(err, user) {
        console.log(user);
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
           return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'support@a11yrecruiter.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'support@a11yrecruiter.com',
        subject: 'A11yRecruiter Password Reset Instructions',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirmpwd) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'support@a11yrecruiter.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'support@a11yrecruiter.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/jobs');
  });
});

// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "Please Login First!");
//     res.redirect("/login");
// }
module.exports = router;
