var express = require('express');
var path = require("path");
var mids = require("./middlewares");
var userslib = require("../libs/users");
var docslib = require("../libs/doc");
var revslib = require("../libs/revision");
var clib = require("../libs/commons");
var async = require("async");

module.exports = (app,pool) => {
	// ROUTE <POST> Force the Revision system to version the current document
	app.post("/api/force/:id",mids.isUserAPI,(req,res)=>{
		docslib.getDocument(req.params.id,(err,org) => {
			if(err) return res.status(500).send(err);
			if(!org) return res.status(404).send("DOCUMENT NOT FOUND");
			revslib.insertNewRevision(req.params.id,Date.now(),org.c,(err2,org2) => {
				if(err2) return res.status(500).send(err2);
				return res.status(200).send(org2);
			});
		});
	});

	//ROUTE <GET> List Revisions of a document. Paginated.
	app.get("/api/rev/list/:id",mids.isUserAPI, (req,res) => {
		docslib.documentExists(req.params.id,(err,org) => {
			if(err) return res.status(500).send(err);
			if(!org) return res.status(404).send("DOCUMENT NOT FOUND");
			revslib.getRevisionList(req.params.id,(err2,org2) => {
				if(err2) return res.status(500).send(err2);
				if(org2.length) return res.status(200).send(org2);
				return res.status(404).send("NO REVISIONS FOUND")
			});
		});
	});

	//ROUTE <GET> Get Revision of a Document.
	app.get("/api/rev/:id/:dex",mids.isUserAPI,(req,res) => {
		docslib.documentExists(req.params.id,(err,org) => {
			if(err) return res.status(500).send(err);
			if(!org) return res.status(404).send("DOCUMENT NOT FOUND");
			revslib.getSpecificRevision(req.params.id,req.params.dex,(err2,org2) => {
				if(err2) return res.status(500).send(err2);
				if(org2.length) return res.status(200).send(org2[0]);
				org2.index = Number(org2.index);
				return res.status(404).send("NO REVISIONS FOUND")
			});
		});
	});
	app.post("/api/rev/branch/:id/:dex",mids.isUserAPI, mids.docRoutes.putMetadata,(req,res) => {
		let mdata = req.body;
		let payload = {
			ndid: null,
			content:null
		}
		async.waterfall([
		(cb) => {
			//DETERMINE EXISTENCE AND OWNERSHIP
			docslib.documentOwnership(req.params.id,req.user.id,(err,org) => {
				if(err) return cb(err,pay);
				if(!org) return cb(404,pay);
				return cb(null,payload);
			});
		},
		(pay,cb) => {
			//CREATE A NEW FILE
			docslib.newDocument(req.user.id,(err,org) => {
				if(err) return cb(err,pay);
				if(!org) return cb(400,pay);
				docslib.newDocumentPG(pool,req.user.id,org.id,org.stamp, (eerr,oorg) => {
					if(eerr){
						docslib.deleteDocument(req.user.id,req.params.id);
						return cb(eerr,pay);
					}
					if(!oorg){ 
						docslib.deleteDocument(req.user.id,req.params.id);
						return cb(400,pay);
					}
					pay.ndid = org.id
					return cb(null,pay);
				});
			});
		},
		(pay,cb) => {
			//GET REVISION CONTENT
			revslib.getSpecificRevision(req.params.id,req.params.dex,(err,org) => {
				if(err) return cb(err,pay);
				if(!org) return cb(400,pay);
				pay.content = org[0].c
				return cb(null,pay);
			});
		},
		(pay,cb) => {
			//UPDATE IT WITH CONTENT
			docslib.updateContent(pay.ndid,pay.content,(err,org) => {
				if(err) return cb(err,pay);
				if(!org) return cb(400,pay);
				return cb(null,pay);
			});
		},
		(pay,cb) => {
			//UPDATE ITS METADATA
			docslib.updateMetadata(pay.ndid,mdata,(err,org) => {
				if(err) return cb(err,pay);
				if(!org) return cb(400,pay);
				return cb(null,pay);
			});
		}],
		(err,pay) => {
			if(err){
				if(pay.ndid) return res.status(400).send();
				docslib.deleteDocumentPG(pool,req.user.id,pay.ndid);
				docslib.deleteDocument(req.user.id,pay.ndid);
				return res.status(400).send();
			}
			return res.status(200).send(JSON.stringify({ id: pay.ndid}));
		});
	});
}