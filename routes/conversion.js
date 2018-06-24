var express = require('express');
var request = require('request');
var path = require("path");
var rstr = require("randomstring");
var mids = require("./middlewares");
var docslib = require("../libs/doc");
const PdfLayer = require('pdflayer');
const pdfLayer = new PdfLayer({
    access_key: process.env.PDFLAYER_KEY,
    test: 1
});
module.exports = (app,redis) => {
	app.get("/api/conversion/token", mids.isUserAPI, (req,eres) => {
		redis.exists(req.user.id,(err, res) => {
			if(err) return res.status(500).send(err);
			if(!res){
				var token = rstr.generate(60);
				redis.set(token,1,'EX',10);
				redis.set(req.user.id,1,'EX',10);
				eres.status(200).send(token);
			}
			else eres.status(403).send();
		})
		
	});
	app.get("/api/conversion/pdf/:id", mids.isUserAPI, mids.docRoutes.convtoken, (req,res) => {
		redis.get(req.query.t,(err, result) => {

			if(err) return res.status(500).send(err);
			docslib.getDocument(req.params.id,(err,org) => {
				if(err) return res.status(500).send(err);
				if(!org) return res.status(403).send();
				//res.status(200).send(org)
				var docString = "<html><head></head><body><div>" + org.c + "</div></body></html>";
				pdfLayer.generate(docString, {
		        	page_size: 'Letter' 
		    	}).then(function(pdfResponse) {
		    		redis.del(req.query.t)
		        	pdfResponse.stream.pipe(res);
		    	}).catch(function(err) {
		        	res.status(500).send(err);
		    	});
			});
		});
	});
};