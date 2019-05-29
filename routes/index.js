const express = require("express");
const  router = express.Router({mergeParams: true});
const passport = require("passport");
const User  = require("../models/user");


//index routes
router.get("/", function(req, res){
    res.render("index");
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
    res.render("login");
});

// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/jobs",
        failureRedirect: "/login"
        //failureFlash: true
    }), function(req, res){
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.email
    });
    console.log(newUser.firstName);
    User.register(newUser, req.body.password, function(err, user){
        if(err){
          console.log(err);
        //  return res.render("login", {"error": err.message});
        req.flash("error", "The email you entered is already associated with an account");
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

// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "Please Login First!");
//     res.redirect("/login");
// }
module.exports = router;
