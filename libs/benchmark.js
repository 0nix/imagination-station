var bmark = require("benchmarkemail").BenchmarkAPI;
var api = new bmark(process.env.BMARK_KEY);
module.exports = {
	lists: (callback) => {
		if(!callback) return new Error("requires callback")
		try { 
    		api.listGet({ filter: '', pageNumber: '1', 
    					pageSize: '30', orderBy:'', 
    					sortOrder:'' },(error,data) => {
    			if (error) return callback(error,null);
    			callback(null,JSON.stringify(data));
    		});
		} catch (error) {
    		callback(error.message);
		}
	},
    addContactToList: (fname,lname,n_email,callback) => {
        if(!callback) return new Error("requires callback")
        try { 
            api.listAddContacts({
                listID: process.env.NEWSLETTER_LIST_ID,
                contacts: [{
                    email: n_email,
                    firstname: fname,
                    lastname: lname
            }]},(error,data) => {
                if (error) return callback(error,null);
                callback(null,JSON.stringify(data));
            });
        } catch (error) {
            callback(error.message);
        }  
    }
}
