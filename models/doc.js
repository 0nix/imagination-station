var mongoose = require("mongoose");
var schema = mongoose.Schema({
	id: { type:String, index: true},
	title: String,
	owner: { type:String, index: true},
	sharedTo: [String],
	stamp: { type: Date, default: Date.now },
	created: Date,
	c: String,
	blurb: String,
	proof: String,
	tags: [mongoose.Schema.Types.Mixed],
	notes: [mongoose.Schema.Types.Mixed],
	comments: [mongoose.Schema.Types.Mixed]
});
schema.index({id: 1, owner: 1});
module.exports = mongoose.model("Document",schema);