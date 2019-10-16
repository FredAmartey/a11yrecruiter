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
    // eval(require('locus'));
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
            noMatch = "No Jobs match your search, please try again.";
          }

          res.render("jobs/jobs",{jobs: jobs, noMatch: noMatch, currentUser: req.user, currentGoogleUser: req.user.google});
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


//new route to make a job post
router.get("/jobs/new", function(req, res) {
    res.render("jobs/new");

});

//create route - post a job
router.post("/jobs", function(req, res) {

    //creat a job post
    Job.create(req.body.job, function(err, newJob){

        //if an error occurs display the job post form
        if(err){
            res.render("jobs/new");

            //if no error redirect to jobs page after post is successful
        }else {
            res.redirect("/jobs");
        }
    });
});

//Show route
router.get("/jobs/:id", middleware.isLoggedIn,  function(req, res) {
    Job.findById(req.params.id, function(err, foundJob){
        if(err || foundJob == null){
            req.flash("error","Sorry Job not found");
            // res.redirect("back");
            res.redirect("/jobs");
        }else{
           //render show template with that job
            res.render("jobs/show", {job: foundJob});
        }
    })
});

//Edit route
router.get("/jobs/:id/edit", middleware.isLoggedIn, function(req, res){
 //find job post to edit using it's id
  Job.findById(req.params.id, function(err, foundJob){

    //reder edit template with that job
     res.render("edit", {job: foundJob});
  });
});


//Update route
router.put("/jobs/:id", middleware.isLoggedIn, function(req, res){
   //find and update the correct job
   Job.findById(req.params.id, req.body.job, function(err, updatedJob){
     let jobID = req.params.id;
     if(err) {
       res.redirect("/jobs");

     }else {
       //redirect to the show template with that job
       res.redirect("/jobs/" + jobID);
     }
   });
});

//delete route
router.delete("/job/:id", middleware.isLoggedIn, function(req, res){
  //find job to delete by id
  Job.findByIdAndRemove(req.params.id, function(err){
    //if an error occurs redirect user to the jobs page
    if(err){
      res.redirect("/jobs");
    }

    //if no error occurs and job deletion is successful,
    // redirect user to jobs page
    else {
      res.redirect("/jobs");
    }
  });
});

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
