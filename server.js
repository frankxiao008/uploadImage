
const express = require("express");
const multer = require("multer");
const clientSessions = require("client-sessions");
const bodyParser = require("body-parser");
const path= require("path");
// const dataService = require("./data-service.js");
const fs = require('fs');
const exphbs= require('express-handlebars');
const dataServiceAuth = require("./data-service-auth.js");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(clientSessions({
    cookieName: "session",
    secret: "webassignment",
    duration: 3*60*1000,
    activeDuration: 2*60*1000
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended : true }));
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
            ((url == app.locals.activeRoute) ? ' class="active nav-item" ' : ' class="nav-item"') +  
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'; 
        },   
        equal:function(lvalue, rvalue, options){
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

function ensureLogin(req, res, next){

    if(!req.session.user){
        res.redirect("/login");
    }else{
        next();
    }
}

app.get("/", function(req, res){
    res.render("home");
});

app.get("/about", function(req, res){
    res.render("about");
});



app.get("/images/add", ensureLogin, function(req, res){
    res.render("addImage");
               
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb){
        cb(null, Date.now()+path.extname(file.originalname));
    }
});
const upload = multer({ storage:storage });

app.post("/images/add", ensureLogin, upload.single("imageFile"), function(req, res){
    res.redirect('/images'); 
} );


 app.get("/images", ensureLogin, function(req, res){  
      
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

        res.redirect('/images/add');
    }).catch((err) => {
      res.render("login", {errorMessage: err, userName: req.body.userName});
    });
  });
  




app.get("/logout", function(req, res){
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res)=>{
    res.render("userHistory");
});

app.use(function(req, res){
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11!!!!!!!!!!");
});



dataServiceAuth.initialize()
      .then(function(mes){
          console.log(mes);
          app.listen(HTTP_PORT, function(){
              console.log("app listening on: " + HTTP_PORT);
          });
      }).catch(function(err){
          console.log("unable to start server: " + err);
      });
      


