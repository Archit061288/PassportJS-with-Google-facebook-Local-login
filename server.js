var express = require("express");
var morgan = require("morgan")
var cookieParser =  require("cookie-parser");
var session = require("express-session")
var mongoose = require("mongoose")
var bodyparser =  require("body-parser")
var path = require("path")
var passport = require("passport");
var flash = require("connect-flash")
var Mongostore = require("connect-mongo")(session)

var configDb = require('./config/database.js')
mongoose.connect("mongodb://localhost/nodetuts")
var app = express();

app.use(bodyparser.urlencoded({extended:false}))

var port = process.env.PORT || 3000;

app.use(morgan("dev"))

app.use(cookieParser())


require('./config/passport')(passport)

app.set("views",path.join(__dirname+"/views"))
app.set("view engine","ejs")

app.use(session({
	secret:"mysecretcode",
	saveUninitialized:true,
	resave:true,
	store: new Mongostore({mongooseConnection:mongoose.connection,ttl:2*24*60*60})
}))

app.use(function(req,res,next){
	//console.log(req.session)
	console.log("----------------")
	//console.log(req.user,"here")
	next();
})

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())



require("./app/routes.js")(app,passport)

app.listen(port,function(){
	console.log("server started")
});

