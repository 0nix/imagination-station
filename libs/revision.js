var doc = require("../models/doc");
var pg = require("pg"), Transaction = require('pg-transaction');
module.exports = {
	journal: (doc_id,stamp,ct,callback) => {
		doc.findOne({id: doc_id},(err,record) => {
			if(err) callback(err)
			if(!record) return callback(null,false);
			var prevStamp = record.stamp;
			var curStamp = stamp;
			record.stamp = curStamp
			record.save()
			//TODO: BUILD A COMPARISON THAT IS DECLARED IN FILE, NOT IN CODE
			if(module.exports.dateComparison('d',prevStamp,curStamp) >= 1){
			//if(module.exports.dateComparison('d',prevStamp,curStamp) >= 1){
				module.exports.insertNewRevision(doc_id,curStamp,ct,(err,gen) => {
					if(err) return callback(err);
					if(callback) return callback(null,gen);
				});
			}
		});
	},
	insertNewRevision:(doc_id,stamp,ct,callback) => {
		module.exports.getLatestRevNumber(doc_id,(err,lastrev)=>{
			if(err) callback(err);
			var nowRev = lastrev + 1;
			var conn = new pg.Client(process.env.DATABASE_URL);
			conn.connect((err) => {
				var tx = new Transaction(conn);
				tx.hasError = false;
				tx.on('error', (err) => {
					tx.hasError = true;
					conn.end.bind(conn);
					return callback(err); 
				});
				tx.begin();
				tx.query("UPDATE docs SET lastrev = $1, laststamp = $2 WHERE id = $3;",[nowRev,stamp,doc_id]);
				tx.query("INSERT INTO revisions (id,index,c,stamp) VALUES ($1,$2,$3,$4);",[doc_id,nowRev,ct,stamp]);
				tx.commit(() => {
					if(!tx.hasError){
						conn.end.bind(conn)
						return callback(null,doc_id)
					}	
				});
			});
		});	
	},
	dateComparison:(datepart, fromdate, todate) => {	
		  datepart = datepart.toLowerCase();	
		  var diff = todate - fromdate;	
		  var divideBy = { w:604800000, 
		                   d:86400000, 
		                   h:3600000, 
		                   n:60000, 
		                   s:1000 };	
		  
		  return Math.floor( diff/divideBy[datepart]);
	},
	getLatestRevNumber:(doc_id,callback) => {
		//TODO: GET LATEST REVISION NUMBER
		var conn = new pg.Client(process.env.DATABASE_URL);
		conn.connect((err) => {
			if(err) return callback(err);
			conn.query("SELECT lastrev FROM docs WHERE id = $1",[doc_id],(err,set) => {
				if(err) return callback(err);
				conn.on('drain', conn.end.bind(conn));
				return callback(null,Number(set.rows[0].lastrev));
			});		
		});
	},
	getRevisionList:(doc_id,callback) => {
		var conn = new pg.Client(process.env.DATABASE_URL);
		conn.connect((err) => {
			if(err) return callback(err);
			conn.query("SELECT id,index,stamp FROM revisions WHERE id = $1",[doc_id],(err,set) => {
				if(err) return callback(err);
				conn.on('drain', conn.end.bind(conn));
				return callback(null,set.rows);
			});		
		});	
	},
	getSpecificRevision:(doc_id,index,callback) => {
		var conn = new pg.Client(process.env.DATABASE_URL);
		conn.connect((err) => {
			if(err) return callback(err);
			conn.query("SELECT id,index,c,stamp FROM revisions WHERE id = $1 AND index = $2",[doc_id,index],(err,set) => {
				if(err) return callback(err);
				conn.on('drain', conn.end.bind(conn));
				return callback(null,set.rows);
			});		
		});	
	}
}