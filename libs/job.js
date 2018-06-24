var job = require("../models/job");
var usr = require("./users")
var rstr = require("randomstring");
var loop = require("lupus");
var san = require("sanitize-html");
var pg = require("pg"), Transaction = require('pg-transaction');
module.exports = {
	jobExists: (_id,callback) => {
		job.findOne({id: _id},(err,record) => {
			if(err) callback(err);
			if(!record) return callback(null,false);
			else return callback(null,true);
		});
	},
	jobOwnership: (_id,_oid,callback) => {
		job.findOne({id: _id, owner:_oid},(err,record) => {
			if(err) callback(err);
			if(!record) return callback(null,false);
			else return callback(null,true);
		});
	},
	getJob: (_id,callback) => {
		//TODO: DETERMINE IF THE AUTHOR IS ALLOWED TO SEE DOCUMENT
		// EITHER BY OWNERSHIP OR SHARING
		module.exports.jobExists(_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("JOB DOES NOT EXIST");
			job.findOne({id: _id},(err,record) => {
				if(err) callback(err)
				if(!record) return callback(null,false);
				else return callback(null,record);
			});
		});
	},
	listJobsByOwner: (owner_id,offset, limit, callback) => {
		job.find({owner:owner_id}).select('-_id -_v -owner')
		.sort({score: 1, stamp: -1})
		.skip(offset).limit(limit)
		.exec((err,records) => {
			if(err) return callback(err);
			return callback(null,records);
		});
	},
	listJobsByScore: (offset,limit,callback) => {
		job.find().select('-_id -_v -owner')
		.sort({score: 1, stamp: -1})
		.skip(offset).limit(limit)
		.exec((err,records) => {
			if(err) return callback(err);
			return callback(null,records);
		});
	},
	keywordSearch: (offset,limit, words, callback) => {
		job.find().select('-_id -_v')
		.where("tags").in(words)
		.sort({score: 1, stamp: -1})
		.skip(offset).limit(limit)
		.exec((err,records) => {
			if(err) return callback(err);
			return callback(null,records);
		});
	},
	updateJobScore: (_id,_score) => {
		module.exports.jobExists(_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			job.findOne({id: _id},(err,record) => {
				if(err) callback(err)
				if(!record) return callback(null,false);
				else{
					record.score = _score;
					record.save(function(err){
						if(callback){
							return callback(null,true);
						}
					});
				}
			});
		});
	},
	updateJob: (_id,meta,callback) => {
		module.exports.jobExists(_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("DOCUMENT DOES NOT EXIST");
			loop(0,meta.keywords.length,(i) => {
			//iteration.
				meta.keywords[i] = san(meta.keywords[i]);
			}, () => {
				job.findOne({id: _id},(err,record) => {
					if(err) callback(err)
					if(!record) return callback(null,false);
					else{

						record.title = san(meta.title) || "Untitled Job";
						record.c = san(meta.c) || "Your Job Description...";
						record.stamp = Date.now();
						record.tags = meta.keywords;
						record.vacancy = meta.vac;
						//TODO: UPDATE SHAREDTO
						//TODO: MAKE SURE THE TAGS IN THE RECORD ARE VALID TAGS
						//TODO: MAKE SURE THAT ALL ELEMENTS IN SHARED TO ARE NETWORKED ITEMS
						record.save(function(err){
							if(callback){
								return callback(null,true);
							}
						});
					}
				});
			});
		});
	},
	newJob: (owner_id,payload,callback) => {
		var d_id = rstr.generate(40);
		var d_date = Date.now();
		loop(0,payload.keywords.length,(i) => {
			//iteration.
			payload.keywords[i] = san(payload.keywords[i]);
		}, () => {
			//done callback
			module.exports.jobExists(d_id,(err,isThere) => {
				if(err) return callback(err)
				if(isThere) return callback("JOB ID EXISTS");
				var j = new job();
				j.id = d_id;
				j.owner = owner_id;
				j.displayName = payload.name;
				j.stamp = d_date;
				j.created = d_date;
				j.score = 100;
				j.vacancy = payload.vac;
				j.tags = payload.keywords;
				j.title = san(payload.title) || "Untitled Document";
				j.c = san(payload.c) || "Your Job Description...";
				//TODO: UPDATE SHAREDTO
				//TODO: MAKE SURE THE TAGS IN THE RECORD ARE VALID TAGS
				//TODO: MAKE SURE THAT ALL ELEMENTS IN SHARED TO ARE NETWORKED ITEMS
				j.save((err) => {
					if(err) return callback(err)
					return callback(null,{id: d_id, stamp: d_date})
				});
			});
		})
		
	},
	newJobPG: (pool,owner_id,job_id,stamp,callback) => {
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
				tx.query("INSERT INTO network (id,typdef) VALUES($1,$2);",[job_id,"JOB"]);
				//tx.query("INSERT INTO docs (id,owner,lastrev,laststamp) VALUES ($1,$2,$3,$4);",[doc_id,nid.id,0,stamp]);
				tx.commit(() => {
					if(!tx.hasError){
						release();
						return callback(null,job_id)
					}	
				});
			});
		});
	},
	deleteJob: (owner_id,_id,callback) =>  {
		module.exports.jobExists(_id,(err,isThere) => {
			if(err) return callback(err);
			if(!isThere) return callback("JOB DOES NOT EXIST");
			job.remove({id: _id, owner:owner_id},(err,record) => {
				if(err) return callback(err);
				return callback(null,true);
			});
		});
	},
	deleteJobPG: (pool,owner_id,job_id,callback) =>  {
		module.exports.jobExists(job_id,(err,isThere) => {
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
					//tx.query("DELETE FROM revisions WHERE id = $1;",[doc_id]);
					//tx.query("DELETE FROM docs WHERE id = $1;",[doc_id]);
					tx.query("DELETE FROM network WHERE id = $1;",[job_id]);
					tx.commit(() => {
						if(!tx.hasError){
							release();
							return callback(null,job_id)
						}	
					});
				});
			});
		});
	}
}