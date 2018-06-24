var express = require('express');
var path = require("path");
var userslib = require("../libs/users");
var email = require("../libs/benchmark");
var mids = require("./middlewares");
module.exports = (app,pool) => {
	app.get("/",(req,res) => {
	return res.render(path.join(__dirname, '../build/index.html'));
	});
	app.get("/login",(req,res) => {
		return res.render(path.join(__dirname, '../build/login.html'));
	});
	app.get("/home", mids.isUserAuth,(req,res) => {
		/*userslib.getUser(req.user.id,(err,org) => {
			if(err) return res.status(500).send(err);
			return res.status(200).send(org);
		});
		/*userslib.newUserReg("auth0|42342323sas",(err,org) => {
			if(err) return res.status(500).send(err);
			return res.status(200).send(org);
		});*/
		//return res.render(path.join(__dirname, '../build/editor.html'));
		/*email.lists((err,data) => {
			if(err) return res.status(500).send(err);
			res.status(200).send(data);
		});*/
		return res.render(path.join(__dirname, '../build/home.html'));
	});
	app.get("/jobs",mids.isUserAuth,(req,res) => {
		return res.render(path.join(__dirname, '../build/job.html'));
	})
	app.get("/history",mids.isUserAuth,(req,res) => {
		return res.render(path.join(__dirname, '../build/rev.html'));
	});
	app.get("/editor",mids.isUserAuth,(req,res) => {
		return res.render(path.join(__dirname, '../build/editor.html'));
	})
	app.get("/fail",(req,res) => {
		return res.status(200).send("Failed to log in.");
	});
	app.get("/test",(req,res) => {
		return res.status(200).send("Imagination Station Live!");
	});
	app.get('/logout', (req, res) => {
	  req.logout();
	  res.redirect('/');
	});
}