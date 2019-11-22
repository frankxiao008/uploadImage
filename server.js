const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path= require("path");
// const dataService = require("./data-service.js");
const fs = require('fs');
const exphbs= require('express-handlebars');
const HTTP_PORT = process.env.PORT || 8080;
const app = express();






app.use(express.static('public/views'));
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
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +  
            '><a href="' + url + '">' + options.fn(this) + '</a></li>'; } ,
        
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
    console.log("home is called")
    res.render("home");
});


app.get("/images/add", function(req, res){
    res.render("addImage");
               
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

app.use(function(req, res){
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
});



app.listen(HTTP_PORT, () => console.log(`app listening on port ${HTTP_PORT}!`));