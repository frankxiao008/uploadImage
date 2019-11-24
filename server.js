const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path= require("path");
// const dataService = require("./data-service.js");
const fs = require('fs');
const exphbs= require('express-handlebars');
const HTTP_PORT = process.env.PORT || 8080;
const app = express();






app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(function(req,res,next){     
    let route = req.baseUrl + req.path;     
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");     
    next(); 
}); 

app.engine('.hbs', exphbs({ 
    extname: ".hbs",
    defaultLayout: "main",
    helpers:{
        navLink: function(url, options){     return '<li' +          
            ((url == app.locals.activeRoute) ? ' class="active nav-item"' : ' class="nav-item"') +  
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'; } ,
        
            equal:(lvalue, rvalue, options)=>{
            if(arguments.length <3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }

       
    }
}));
app.set("view engine", ".hbs");

app.get("/", function(req, res){
   
    res.render("home");
});


app.get("/images/add", function(req, res){
    res.render("addImage");
               
});

app.get("/signup", function(req, res){
    res.render("signup");             
});



const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb){
        cb(null, Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({storage:storage});



app.get("/images",  function(req, res){  
      
    fs.readdir("./public/images/uploaded", function(err, items){      
        res.render("images", {data:items});
   });

});




app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", function(req, res){
    dataServiceAuth.registerUser(req.body)
        .then(()=>{
            res.render("register", {successMessage: "User created"});
        }).catch((err)=>{
            res.render("register", { errorMessage: err, userName: req.body.userName  });
        });
});

app.post("/login", (req, res) => {

    req.body.userAgent = req.get('User-Agent');
  
    dataServiceAuth.checkUser(req.body).then((user) => {

    req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
    }

        res.redirect('/employees');
    }).catch((err) => {
      res.render("login", {errorMessage: err, userName: req.body.userName});
    });
  });
  


app.get("/logout", function(req, res){
    req.session.reset();
    res.redirect("/");
});

app.use(function(req, res){
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
});


app.listen(HTTP_PORT, () => console.log(`app listening on port ${HTTP_PORT}!`));