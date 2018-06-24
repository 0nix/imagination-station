var express = require('express');
var email = require("../libs/benchmark");
var mids = require("./middlewares");

module.exports = (app) => {
app.post("/news/signup", mids.missingBody, (req,res) =>{
	//console.log(req);
	if(!req.body.email || !req.body.aname || !req.body.lname)
		return res.status(400).send("NOT ENOUGH DATA");

	email.addContactToList(req.body.aname,req.body.lname,req.body.email, (err, resp) => {
		if(err) return res.status(500).send(err);
		res.status(200).send("Success Adding!");
	});

}); 
}