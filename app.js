var express = require("express"),
    app     = express(),
bodyParser  = require("body-parser"),
mongoose    = require("mongoose"),
passport    = require("passport"),
Job         = require("./models/jobs"),
User        = require("./models/user"),
flash = require('connect-flash'),
LocalStrategy = require("passport-local"),
methodOverride = require("method-override");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');


// APP CONFIG
mongoose.connect("mongodb://localhost:27017/a11yrecruiter_app", {useNewUrlParser:true});
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

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
    passwordField: 'password'
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
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        })
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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


// MONGOOSE/MODEL CONFIG


//create a blog
// Job.create({
//     title: "Front End Developer, Summer Internship 2019",
//     company: "Portfolio",
//     type: "Part time paid position",
//     location: "Manhattan NY",
//     description: "Portfolio is looking for bright, energetic, and motivated individuals to contribute to ongoing projects. EagleDream's website and web application development projects target a variety of different markets including marketing, research, health care, and retail. Current development leverages a diverse set of tools and technologies including leading web development frameworks, web content management systems (WordPress Drupal), and eCommerce platforms (Shopify). Candidates must have solid understanding of web-based development (HTML, CSS, JavaScript) including experience with responsive web development and take pride in converting creative/designs into pixel perfect web implementations. Database development experience is a plus.",
//     requirements: "Experience applying at least some of the following is preferred but not necessarily required: Relational Databases (PostgreSQL, MySQL, Interbase, etc.), Data Modeling / Entity-Relationship modeling ,Web Services (REST, SOAP, XSDs, JSON), Web Technologies, HTML, JavaScript, CSS, Responsive Front-End Development, Web Application Development Frameworks, Bootstrap, JQuery, AngularJS",
//     applydate:"Apply before Friday 4/31"
// });



// RESTFUL ROUTES


app.get("/", function(req, res){
  res.render("index"); 
});


//index route
// app.get("/",   function(req, res){
//     //retrieve all jobs from the database
//     Job.find({}, function(err, jobs){
//         if(err){
//             console.log("ERROR!!!!");
//         }else{
//             res.render("index", {jobs: jobs, currentUser: req.user}); 
//         }
//     });
      
// });


//new route
app.get("/jobs/new", function(req, res) {
   res.render("new");
   
});

//create route - post a job
app.post("/jobs", function(req, res) {
    
    //creat a job post
    Job.create(req.body.job, function(err, newJob){
        
        //if an error occurs display the job post form
        if(err){
            res.render("new");
            
        //if no error redirect to jobs page after post is successful
        }else {
            res.redirect("/jobs");
        }
    });
});

//Show route
app.get("/jobs/:id", isLoggedIn,  function(req, res) {
    Job.findById(req.params.id, function(err, foundJob){
       if(err){
           res.redirect("/jobs");
       }else{
           res.render("show", {job: foundJob});
       } 
    })
});



app.get("/about", function(req, res) {
    res.render("about");
})

app.get("/profile", function(req, res) {
    res.render('profile', { user: req.user });
})


//AUTH ROUTES

app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback', 
      passport.authenticate('google', { successRedirect: '/profile',
                                          failureRedirect: '/' }));
 
 //show register form
 // app.get("/register", function(req, res){
 //     res.render("register");
 // });

 // show login form
app.get("/login", function(req, res){
   res.render("login"); 
});  
 
 //handle sign up logic
 app.post("/register", function(req, res){
     var newUser = new User({
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        username: req.body.email
    });
     console.log(newUser.firstName);
     User.register(newUser, req.body.password, function(err, user){
         if(err){
             console.log(err);
             return res.render("login");
         }
         passport.authenticate("local")(req, res, function(){
             // res.redirect("/jobs");
             
             res.render('profile', { user: req.user });

         });
     });
 });
 

// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/profile",
        failureRedirect: "/login"
    }), function(req, res){
});
 


//logout route
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, process.env.IP, function(){
    console.log("A11YRECRUITER SERVER IS RUNNING!");
});