//jshint esversion: 6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const request = require("request");

// Init express app, serve static files and include ejs and bodyParser.
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

//-----------------------------DB setup--------------------------------------
mongoose.connect("mongodb://localhost:27017/blog-v3DB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});
const Post = mongoose.model("Post", postSchema);

//Check if DB is empty, create a test post and save it if yes.
Post.find({}, (err, results) => {
  if (results.length === 0) {
    const testPost = new Post({
      title: "Test post",
      content: "Test post body content"
    });
    testPost.save();
  }
});

// Routing - Home Page
app.get("/", (req, res) => {
  //find 5 most recent posts.
  Post.find({}, (err, results) => {
    res.render("home", {
      posts: results
    });
  }).sort({_id: -1}).limit(5);
});

// Routing - About/Contact
app.get("/about", (req, res) => {
  res.render("about");
});

// Routing - Compose
app.route("/compose")
  .get((req, res) => {
    res.render("compose");
  })
  .post((req, res) => {
    // get post details from submission.
    const newPost = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });
    newPost.save((err) => {
      if (err) {
        res.render("failure");
      } else {
        res.redirect("/");
      }
    });
  });

// Routing - Individual Post page
app.get("/posts/:postId", (req, res) => {
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, (err, post) => {
    if (err) {
      res.render("failure");
    } else {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    }
  });
});

// Routing - Signup
app.get("/signup", (req, res) => {
  res.render("signup");
});

//Routing - Success & Failure - not possible to GET
app.post("/success", (req, res) => {
  res.redirect("/");
});
app.post("/failure", (req, res) => {
  res.redirect("/");
});

// Fetch an additional 5 posts
app.get("/fetch/:postsToGet", (req, res)=> {
  const postsToGet = Number(req.params.postsToGet);

  Post.find({}, (err, results) => {
    if(err){
      res.send(JSON.stringify({res:"failure"}));
    } else{
      res.send(results);
    }
  }).sort({_id: -1}).skip(postsToGet).limit(5);
});

//--------------------------Signup API CALL to MailChimp----------------------
app.post("/signup", (req, res) => {
  //Get submission data.
  var data = {
    members: [{
      email_address: req.body.Email,
      status: "subscribed",
      merge_fields: {
        FNAME: req.body.fName,
        LNAME: req.body.lName
      }
    }]
  };

  //Prepare data for API call.
  var jsonData = JSON.stringify(data);
  var url = `${process.env(MAILCHIMP_URL)}`;
  var options = {
    url: url,
    method: "POST",
    headers: {
      "Authorization": `John1 ${process.env(API_KEY)}`
    },
    body: jsonData
  };

  //Make API Call and redirect to success or failure page.
  request(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      res.render("failure");
    } else {
      res.render("success");
    }
  });
});

// ----------------------Port and server setup-----------------------------
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log(`Server started on port: ${port}!`);
});
