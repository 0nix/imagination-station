module.exports = {
	stdRouterResponse: (err,org) => {
		if(err) return res.status(500).send(err);
		if(!org) return res.status(403).send();
		res.status(200).send(org)
	},
	docMetaEls: ["title"]
}