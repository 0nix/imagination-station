var pg = require("pg"), Transaction = require('pg-transaction');
var rstr = require("randomstring");
module.exports = {
	getUser: (pool,uid,callback) => { 
		pool.connect((err,client,release) => {
			client.query("SELECT * FROM vw_users WHERE azid = $1",[uid],(err,set) => {
			    release(); 
			    if(err) return callback(err);
			    else return callback(null,set.rows[0]);
			}); 
		});
	},
	newUserReg:(pool,auth0_id,callback) => {
		var new_id = rstr.generate(40);
		pool.connect((err,client,release) => {
			var tx = new Transaction(client);
			tx.hasError = false;
			tx.on('error', (err) => {
				tx.hasError = true;
				release();
				return callback(err); 
			});
			tx.begin();
			tx.query("INSERT INTO network (id,typdef) VALUES($1,$2);",[new_id,"USER"]);
			tx.query("INSERT INTO users (azid) VALUES ($1);",[auth0_id]);
			tx.query("INSERT INTO network_user (nid, uid) VALUES ($1,$2);",[new_id,auth0_id]);
			tx.commit(() => {
				if(!tx.hasError){
					release();
					return callback(null,auth0_id)
				}	
			});
		});
	},
	userAllowedDoc: (user_id,doc_id,callback) => {
		//TODO, GET DOCUMENT AUTHOR AND SHAREDTO FIELDS AND CONFIRM IT MATCHES WITH USERS'S ID 
		//TODO, GET USER'S MEMBERSHIP TO GROUPS
		//TODO, CHECK IF DOCUMENT SHAREDTO FIELD INCLUDES GROUPS THE USER IS A PART OF
	}
}