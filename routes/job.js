var express = require('express');
var path = require("path");
var mids = require("./middlewares");
var userslib = require("../libs/users");
var joblib = require("../libs/job");
module.exports = (app,pool) => {
app.get("/api/job/listowner", mids.isUserAPI, mids.jobRoutes.list, (req,res) => {
	joblib.listJobsByOwner(req.user.id, req.query.offset, req.query.limit, (err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org);
	});
});
app.get("/api/job/listscore", mids.isUserAPI, mids.jobRoutes.list, (req,res) => {
	joblib.listJobsByScore(req.query.offset, req.query.limit, (err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org);
	});
});
app.put("/api/job/search",mids.isUserAPI,mids.jobRoutes.search, (req,res) => {
	joblib.keywordSearch(req.query.offset, req.query.limit, req.body.keywords, (err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org);
	});
});
app.get("/api/job/:id", mids.isUserAPI, (req,res) => {
	joblib.getJob(req.params.id,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org)
	});
})
app.put("/api/job/:id", mids.isUserAPI, mids.jobRoutes.putContent, (req,res) => {
	var mdata = req.body;
	joblib.updateJob(req.params.id,mdata,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send({ id:org})
	});
});
app.delete("/api/job/:id", mids.isUserAPI, (req,res) => {
	joblib.deleteJob(req.user.id,req.params.id,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		joblib.deleteJobPG(pool,req.user.id,req.params.id,(eerr,oorg) => {
			if(eerr){
				return res.status(500).send(eerr);
			}
			if(!oorg){ 
				return res.status(403).send(); 
			}
			return res.status(200).send(oorg);
		});
	});
});
app.post("/api/job", mids.isUserAPI, mids.jobRoutes.postContent, (req,res) => {
	var mdata = req.body;
	if(Object.keys(req.user.name).length === 0 )
		mdata.name = req.user.displayName;
	else
		mdata.name = req.user.name;
	console.log(mdata, req.user.displayName, req.user.name);
	joblib.newJob(req.user.id, mdata, (err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		joblib.newJobPG(pool,req.user.id,org.id,org.stamp, (eerr,oorg) => {
			if(eerr){
				joblib.deleteJob(req.user.id,req.params.id);
				return res.status(500).send(eerr);
			}
			if(!oorg){ 
				joblib.deleteJob(req.user.id,req.params.id);
				return res.status(403).send(); 
			}
			return res.status(200).send({id: oorg});
		});
	});
});
}