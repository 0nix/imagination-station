var express = require('express');
var path = require("path");
var mids = require("./middlewares");
var userslib = require("../libs/users");
var docslib = require("../libs/doc");
var revslib = require("../libs/revision");
var clib = require("../libs/commons")
module.exports = (app,pool) => {
app.get("/api/doc/list", mids.isUserAPI, mids.docRoutes.list, (req,res) => {
	docslib.listDocumentsByOwner(req.user.id, req.query.offset, req.query.limit, (err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		console.log(req.query)
		res.status(200).send(org);
	});
});
app.get("/api/doc/:id", mids.isUserAPI, (req,res) => {
	docslib.getDocument(req.params.id,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org)
	});
})
app.put("/api/doc/:id", mids.isUserAPI, mids.docRoutes.putMetadata, (req,res) => {
	var mdata = req.body;
	docslib.updateMetadata(req.params.id,mdata,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org)
	});
});
app.put("/api/edit/:id",mids.isUserAPI, mids.docRoutes.putContent, (req,res) => {
	docslib.updateContent(req.params.id,req.body.ct,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org)
	});
});
app.delete("/api/doc/:id", mids.isUserAPI, (req,res) => {
	docslib.deleteDocument(req.user.id,req.params.id,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		docslib.deleteDocumentPG(pool,req.user.id,req.params.id,(eerr,oorg) => {
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
app.post("/api/doc", mids.isUserAPI, (req,res) => {
	console.log("post: "+req.user.id);
	docslib.newDocument(req.user.id,(err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		docslib.newDocumentPG(pool,req.user.id,org.id,org.stamp, (eerr,oorg) => {
			if(eerr){
				docslib.deleteDocument(req.user.id,req.params.id);
				return res.status(500).send(eerr);
			}
			if(!oorg){ 
				docslib.deleteDocument(req.user.id,req.params.id);
				return res.status(403).send(); 
			}
			return res.status(200).send(oorg);
		});
	});
});
}