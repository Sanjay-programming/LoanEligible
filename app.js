var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser")
const session = require('express-session');

const ejs = require('ejs');
const User = require("./model/User");
var app = express();
var path=require("path");
const { spawn } = require('child_process');//for invoking .py file

const pythonDepsCommand = 'pip install pandas';

spawn(pythonDepsCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing Python dependencies: ${error}`);
    return;
  }
  console.log('Python dependencies installed successfully');
});

var duser;
//mongodbpassword=qk5K5dwp85tX2ZGA, username=sugamganachary
// mongoose.connect('mongodb://127.0.0.1:27017/mp2', { 
//     useNewUrlParser: true 

// }).then(() => console.log('DataBase connection successful'))
//   .catch((err) => console.log(err))
mongoose.connect('mongodb+srv://sugamganachary:qk5K5dwp85tX2ZGA@loanai.6snyonc.mongodb.net/?retryWrites=true&w=majority', { 
    useNewUrlParser: true 

}).then(() => console.log('DataBase connection successfully'))
  .catch((err) => console.log(err))



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(require("express-session")({
//     secret: "Rusty is a dog",
//     resave: false,
//     saveUninitialized: false
// }));
app.use(express.json());
app.use(express.static(path.join(__dirname,'views')));


app.use(session({
  secret: 'session-secret',
  resave: false,
  saveUninitialized: true
}));
//=====================
// ROUTES
//=====================
  
// Showing home page
app.get("/", function (req, res) {
    res.render("home");
});
  


  
// Showing secret page
// app.get("/secret", isLoggedIn, function (req, res) {
//   res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//   res.setHeader("Expires", "0");
//   res.render("secret",{cname: duser});
// });
  

// app.get("/prediction", function (req, res) {
//   res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//   res.setHeader("Expires", "0");
//       res.render("prediction",{cname: duser});
// });
 
// app.get("/secretonot", function (req, res) {
//   res.render("secret",{cname: duser});
// });
// Showing secret page
app.get("/secret",isLoggedIn, function (req, res) {
  if(req.loggedIn){
    res.render("secret", { cname: duser });
  }
  else{
    res.redirect("login");
  }
});

app.get("/prediction",isLoggedIn, function (req, res) {
  if(req.loggedIn){
    res.render("prediction", { cname: duser });
  }
  else{
    res.redirect("login");
  }
});

app.get("/secretonot",isLoggedIn, function (req, res) {
  if(req.loggedIn){
    res.render("secret", { cname: duser });
  }
  else{
    res.redirect("login");
  }
});


// Showing register form
app.get("/register",isLoggedIn, function (req, res) {
  if(req.loggedIn){
    res.render("secret", { cname: duser });
  }
  else{
    res.redirect("register");
  }
});
// Handling user signup
app.post("/register", async (req, res) => {
    const existing = await User.findOne({ username: req.body.username });
    if(existing!=null){
      if(existing.username==req.body.username){
        res.status(400).send('<script>alert("Already Registered"); window.location="/register";</script>');
      }
      else{
        const user = await User.create({
          username: req.body.username,
          password: req.body.password
        });
        if(user.username.length==0 || user.password.length==0){
          alert("Enter the details Completely");
        }
        else{
          req.session.user = user.username;
          duser= req.body.username;
          res.render("secret",{cname: duser});
        }
      }
    }
    else{
      const user = await User.create({
        username: req.body.username,
        password: req.body.password
      });
      if(user.username.length==0 || user.password.length==0){
        alert("Enter the details Completely");
      }
      else{
        req.session.user = user.username;
        duser= req.body.username;
        res.render("secret",{cname: duser});
      }
    }
    
  });
  
//Showing login form
app.get("/login",isLoggedIn, function (req, res) {
  if(req.isLoggedIn){
    res.render("secret", { cname: duser });
  }
  else{
    res.render("login");
  }
});

//Handling user login
app.post("/login", async function(req, res){
    try {
        // check if the user exists
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          //check if password matches
          const result = req.body.password === user.password;
          if (result) {
            log= true;
            duser=user.username;
            req.session.user = user;
            res.render("secret",{cname: duser});
          } else {
            res.status(400).send('<script>alert("Wrong password"); window.location="/login";</script>');
          }
        } else {
          res.status(400).send('<script>alert("Wrong password"); window.location="/login";</script>');
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});
  
//Handling user logout 
app.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});
 

  
// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) return next();
//     res.redirect("/login");
// }
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.sendStatus(401);
  }
}

function isLoggedIn(req, res, next) {
  req.loggedIn = false;
  if (req.session && req.session.user) {
    req.loggedIn = true;
  }
  next();
}

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});

//ml part
app.post('/predict', (req, res) => {
  const inputs = Object.values(req.body);
  // Execute your Python code here
  const pythonScript = spawn('python', ['mlmodel.py', ...inputs]);

  pythonScript.stdout.on('data', (data) => {
    const result = data.toString().trim();
    //res.json({ result });
    if(result=="[0]"){
      res.render("no_eligible", { cname: duser });
    }
    else{
      res.render("yes_eligible", { cname: duser });
    }
  });
  pythonScript.stderr.on('data', (error) => {
    console.error('Python script error:', error.toString());
    res.status(500).json({ error: 'Internal server error' });
  });
});
