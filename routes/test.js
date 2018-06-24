var express = require('express');
var network = require("../libs/network");
var commons = require("../libs/commons");
var mids = require("./middlewares");
module.exports = (app,pool) => {
	app.get("/test/network/:id",(req,res) => {
		network.doesNetExist(req.params.id,(err,org) => {
			if(err) return res.status(500).send(err);
			if(!org) return res.status(403).send();
			res.status(200).send(org)
		});
	});
}