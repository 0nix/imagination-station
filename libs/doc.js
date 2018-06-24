var doc = require("../models/doc");
var rev = require("./revision"), usr = require("./users")
var rstr = require("randomstring");
var san = require("sanitize-html");
var pg = require("pg"), Transaction = require('pg-transaction');
module.exports = {
	documentExists: (doc_id,callback) => {
		console.log("doc exists before: "+doc_id);
		doc.findOne({id: doc_id},(err,record) => {
			if(err) callback(err);
			console.log("doc exists after: "+doc_id);
			if(!record) return callback(null,false);
			else return callback(null,true);
		});
	},
	documentOwnership: (doc_id,user_id,callback) => {
		doc.findOne({id: doc_id, owner:user_id},(err,record) => {
			if(err) callback(err);
			if(!record) return callback(null,false);
			else return callback(null,true);
		});
	},
	getDocument: (doc_id,callback) => {
		//TODO: DETERMINE IF THE AUTHOR IS ALLOWED TO SEE DOCUMENT
		// EITHER BY OWNERSHIP OR SHARING
		module.exports.documentExists(doc_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			doc.findOne({id: doc_id},(err,record) => {
				if(err) callback(err)
				if(!record) return callback(null,false);
				else return callback(null,record);
			});
		});
	},
	listDocumentsByOwner: (owner_id,offset, limit, callback) => {
		doc.find({owner:owner_id}).select('-_id -_v -owner -c')
		.skip(offset).limit(limit)
		.exec((err,records) => {
			if(err) return callback(err);
			return callback(null,records);
		});
	},
	updateMetadata: (doc_id,meta,callback) => {
		module.exports.documentExists(doc_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			doc.findOne({id: doc_id},(err,record) => {
				if(err) callback(err)
				if(!record) return callback(null,false);
				else{
					record.title = meta.title || "Untitled Document";
					//record.stamp = Date.now();
					//TODO: UPDATE NOTES, COMMENTS, TAGS, AND SHAREDTO
					//TODO: MAKE SURE THE TAGS IN THE RECORD ARE VALID TAGS
					//TODO: MAKE SURE THAT ALL ELEMENTS IN SHARED TO ARE NETWORKED ITEMS
					record.save(function(err){
						if(callback){
							if(err) return callback(err);
							rev.journal(doc_id,Date.now(),record.c,(err,t) => {
								console.log(err,t)
							}); 
							callback(null,true);
						}
					});
				}
			});
		});
	},
	updateContent:(doc_id,ct,callback) => {
		var san_ct = san(ct);
		module.exports.documentExists(doc_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			doc.findOne({id: doc_id},(err,record) => {
				if(err) callback(err)
				if(!record) return callback(null,false);
				else{
					record.c = san_ct;
					record.blurb = san_ct.substring(0,300);
					//record.stamp = Date.now();
					//TODO: INCORPORATE REVISION JOURNALING HERE
					record.save(function(err){
						if(callback){
							if(err) return callback(err);
							rev.journal(doc_id,Date.now(),san_ct,(err,t) => {
								console.log(err,t)
							});
							callback(null,true);
						}
					});
				}
			});
		});
	},
	newDocument: (owner_id,callback) => {
		var d_id = rstr.generate(40);
		var d_date = Date.now()
		console.log("newdoc before: "+d_id);
		module.exports.documentExists(d_id,(err,isThere) => {
			if(err) return callback(err)
			if(isThere) return callback("DOCUMENT EXISTS");
			console.log("newdoc after: "+d_id);
			var d = new doc();
			d.id = d_id;
			d.owner = owner_id;
			d.stamp = d_date;
			d.created = d_date;
			d.title = "Untitled Document";
			d.save((err) => {
				if(err) return callback(err)
				return callback(null,{id: d_id, stamp: d_date})
			});
		});
	},
	newDocumentPG: (pool,owner_id,doc_id,stamp,callback) => {
		usr.getUser(pool,owner_id,(err,nid) => {
			if(err) return callback(err);
			pool.connect((err,client,release) => {
				var tx = new Transaction(client);
				tx.hasError = false;
				tx.on('error', (err) => { 
					tx.hasError = true;
					release();
					return callback(err); 
				});
				tx.begin();
				tx.query("INSERT INTO network (id,typdef) VALUES($1,$2);",[doc_id,"DOC"]);
				tx.query("INSERT INTO docs (id,owner,lastrev,laststamp) VALUES ($1,$2,$3,$4);",[doc_id,nid.id,0,stamp]);
				tx.commit(() => {
					if(!tx.hasError){
						release();
						return callback(null,doc_id)
					}	
				});
			});
		});
	},
	deleteDocument: (owner_id,doc_id,callback) =>  {
		module.exports.documentExists(doc_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			doc.remove({id: doc_id, owner:owner_id},(err,record) => {
				if(err) return callback(err);
				return callback(null,true);
			});
		});
	},
	deleteDocumentPG: (pool,owner_id,doc_id,callback) =>  {
		module.exports.documentExists(doc_id,(err,isThere) => {
			usr.getUser(pool,owner_id,(err,nid) => {
				pool.connect((err,client,release) => {
					var tx = new Transaction(client);
					tx.hasError = false;
					tx.on('error', (err) => { 
						tx.hasError = true;
						release();
						return callback(err); 
					});
					tx.begin();
					tx.query("DELETE FROM revisions WHERE id = $1;",[doc_id]);
					tx.query("DELETE FROM docs WHERE id = $1;",[doc_id]);
					tx.query("DELETE FROM network WHERE id = $1;",[doc_id]);
					tx.commit(() => {
						if(!tx.hasError){
							release();
							return callback(null,doc_id)
						}	
					});
				});
			});
		});
	},
	forceJournal: (owner_id,doc_id,callback) => {
		module.exports.documentExists(doc_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			doc.findOne({id: doc_id},(err,record) => {
				if(err) return callback(err);
				rev.journal(doc_id,s,san_ct);
				callback(null,true);
			});
		});
	}
}