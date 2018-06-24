var mongoose = require("mongoose");
var schema = mongoose.Schema({
	id: { type:String, index: true},
	title: String,
	owner: { type:String, index: true},
	displayName: { type:String, index: true},
	sharedTo: [String],
	stamp: { type: Date, default: Date.now },
	created: Date,
	c: String,
	vacancy: {type:Boolean, default: false},
	tags: [mongoose.Schema.Types.Mixed],
	score: Number,
	notes: [mongoose.Schema.Types.Mixed],
	comments: [mongoose.Schema.Types.Mixed]
});
schema.index({score: 1, stamp: -1});
module.exports = mongoose.model("Job",schema);