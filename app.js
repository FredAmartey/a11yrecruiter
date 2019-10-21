const express = require("express"),
   app     = express(),
bodyParser  = require("body-parser"),
mongoose    = require("mongoose"),
passport    = require("passport"),
User        = require("./models/user"),
flash = require('connect-flash'),
LocalStrategy = require("passport-local"),
methodOverride = require("method-override");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('./auth');
const port = process.env.PORT || 3000;
const router = express.Router();

//Router config
router.use(function(req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path);
  next();
});

router.use('/projects', function(req, res, next) {
  // ... maybe some additional /projects logging ...
  next();
});

//configure dotenv
require('dotenv').config();

//require routes from the routes directory
const jobRoutes   = require("./routes/jobs"),
      authRoutes  = require("./routes/index");

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/a11yrecruiter_db", {useNewUrlParser:true});
mongoose.set('useCreateIndex', true);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Rusty",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    // tokenField: 'token'
  },
  User.authenticate()
));

passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
      },
      function(accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
                User.findOne({'google.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user)
                        return done(null, user);
                    else {
                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = accessToken;
                        newUser.google.email = profile.emails[0].value;
                        newUser.google.fullName = profile.displayName;
                        newUser.google.firstName = profile.name.givenName;
                        newUser.google.lastName = profile.name.familyName;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                        console.log(profile);
                    }
                });
            });
        }

    ));

passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

//custom middleware to handle every route that has currentUser defined
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.currentGoogleUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//use routes - jobs and authentication routes
app.use(jobRoutes);
app.use(authRoutes);

app.get("/about", function(req, res) {
    res.render("about");
});

// app.get("/profile", function(req, res) {
//     res.render('profile', { user: req.user });
// });
 //show register form
 // app.get("/register", function(req, res){
 //     res.render("register");
 // });


//


app.use('/projects/a11yrecruiter', router);
app.listen(port, process.env.IP, function(){
    console.log(`A11YRECRUITER SERVER IS RUNNING! - listening on port ${port}`);
});
