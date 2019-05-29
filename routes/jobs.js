const express = require("express");
const router = express.Router({mergeParams: true});
const Job = require("../models/jobs");
const middleware = require("../middleware");
// const User  = require("../models/user");

// router.get("/", function(req, res){
// });

//
//  Job.create({
//      title: "Front End Developer, Summer Internship 2019",
//      company: "Portfolio",
//      type: "Part time paid position",
//      location: "Manhattan NY",
//     description: "Portfolio is looking for bright, energetic, and motivated individuals to contribute to ongoing projects. EagleDream's website and web application development projects target a variety of different markets including marketing, research, health care, and retail. Current development leverages a diverse set of tools and technologies including leading web development frameworks, web content management systems (WordPress Drupal), and eCommerce platforms (Shopify). Candidates must have solid understanding of web-based development (HTML, CSS, JavaScript) including experience with responsive web development and take pride in converting creative/designs into pixel perfect web implementations. Database development experience is a plus.",
//      requirements: "Experience applying at least some of the following is preferred but not necessarily required: Relational Databases (PostgreSQL, MySQL, Interbase, etc.), Data Modeling / Entity-Relationship modeling ,Web Services (REST, SOAP, XSDs, JSON), Web Technologies, HTML, JavaScript, CSS, Responsive Front-End Development, Web Application Development Frameworks, Bootstrap, JQuery, AngularJS",
//    applydate:"Apply before Friday 4/31"
// });

//jobs route
router.get("/jobs",  middleware.isLoggedIn,  function(req, res){

    //adding a search api to find a particular job based on user's search
    var noMatch = null // varaible for no results returned from search query
    if(req.query.search){

      //regular expression, uses the escapeRegex function to perform a search query
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');

      //retrieve job based on user's search
      Job.find({title: regex}, function(err, jobs){
        if(err){
          console.log(err);
          console.log("Error!!!!");

        } else{
          if(jobs.length < 1){
            noMatch = "No Jobs match your search query, please try again.";
          }

          res.render("jobs",{jobs: jobs, noMatch: noMatch, currentUser: req.user, currentGoogleUser: req.user.google});
        }
      });
    } else {
      //retrieve all jobs from the database
      Job.find({}, function(err, jobs){
          if(err){
              console.log(err);
              console.log("ERROR!!!!!");
          }else{
              // res.render("index", {jobs: jobs, currentUser: req.user});
              //res.render("jobs", {jobs: jobs, currentUser: req.user});
              res.render("jobs", {jobs: jobs, currentUser: req.user, currentGoogleUser: req.user.google, noMatch: noMatch});
              // res.render("jobs");
          }
      });
    }
});


//new route
router.get("/jobs/new", function(req, res) {
    res.render("new");

});

//create route - post a job
router.post("/jobs", function(req, res) {

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
router.get("/jobs/:id", middleware.isLoggedIn,  function(req, res) {
    Job.findById(req.params.id, function(err, foundJob){
        if(err){
            res.redirect("/jobs");
        }else{
            res.render("show", {job: foundJob});
        }
    })
});

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
