var pg =require("pg");
var dburl = process.env.DATABASE_URL;
module.exports = {
	doesNetExist:(network_id,callback) => {
		var conn = new pg.Client(dburl);
		if(!network_id) return callback(new Error("GIVE ME A NETWORK ID"));
		conn.connect((err) => {
			if(err) return callback(err);
			conn.query("SELECT COUNT(*) FROM network WHERE ID = $1",[network_id], (err,org) => {
				if(err) return callback(err);
				if(org.rows[0].count == 1) return callback(null,true);
				else return callback(null,false);
			});
			conn.on("drain",conn.end.bind(conn));
		});
	}
}