var mongoose = require("mongoose")

var userschema = mongoose.Schema({
	local:{
		username:String,
		password:String
	},
	facebook:{
		id:String,
		token:String,
		email:String,
		name:String
	},
	google:{
		id:String,
		token:String,
		email:String,
		name:String
	}
})

module.exports =  mongoose.model("User",userschema)