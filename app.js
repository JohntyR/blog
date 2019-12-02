  //jshint esversion: 6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const request = require("request");


// init express app and include modules
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));


//----------------mongoose----------------------
mongoose.connect("mongodb://localhost:27017/blog-v3DB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);

//create test post if DB empty
const testPost = new Post({
  title: "Test post",
  content: "Test post body content"
});

Post.find({}, (err, results) => {
  if (results.length === 0) {
    testPost.save();
  }
});

// ------------------------routing----------------------
app.get("/", (req, res)=> {
  Post.find({}, (err, results) => {
    res.render("home", {
      posts: results
    });
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// GET & POST for composing new post
app.route("/compose")
  .get((req, res) => {
    res.render("compose");
  })
  .post((req, res) => {
    const newPost = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });
    newPost.save((err)=>{
      if(!err) {
        res.redirect("/");
      }
    });
  });

// dynamic post pages
app.get("/posts/:postId", (req, res) =>{
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, (err, post)=> {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });
});
// GET & POST for signup to newsletter
app.get("/signup", (req, res) => {
  res.render("signup");
});
//success and failure routes
app.post("/success", (req, res) => {
  res.redirect("/");
});
app.post("/failure", (req, res) => {
  res.redirect("/");
});

//--------------------------Signup API CALL to MailChimp----------------------
app.post("/signup", (req, res) => {
  //get input data
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

  //prepare data for API call
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

  //make API Call and redirect to success or failure page.
  request(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      res.render("failure");
    } else {
      res.render("success");
    }
  });
});

// set up ports
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log(`Server started on port: ${port}!`);
});
