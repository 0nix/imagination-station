const Joi = require('joi'), Celebrate = require('celebrate');
module.exports = {
	isUserAuth: (req, res, next) => {
	  if (!req.isAuthenticated()) return res.redirect('/');
	  next();
	},
	isUserAPI: (req, res, next) => {
	  console.log("auth: " + req.isAuthenticated());
	  if (!req.isAuthenticated()) return res.status(401).send();
	  next();
	},
	missingBody: (req,res,next) => {
		if(!req.body) return res.status(400).send("DATA MISSING");
		next();
	},
	docRoutes: {
		putMetadata: Celebrate({
			body: Joi.object().keys({
				title: Joi.string().required()
			})
		}),
		putContent: Celebrate({
			body: Joi.object().keys({
				ct: Joi.string().required()
			})
		}),
		list: Celebrate({
			query: Joi.object().keys({
				offset:Joi.number().min(0).required(),
				limit:Joi.number().min(5).max(50).required(),
				sort: Joi.string()
			})
		}),
		conversion: Celebrate({
			body: Joi.object().keys({
				doc: Joi.string().required()
			})
		}),
		convtoken: Celebrate({
			query: Joi.object().keys({
				t: Joi.string().required()
			})
		})
	},
	jobRoutes: {
		postContent: Celebrate({
			body: Joi.object().keys({
				title: Joi.string().max(200).required(),
				c: Joi.string().max(10000).required(),
				vac: Joi.boolean().required(),
				keywords: Joi.array().items(Joi.string()).required()
			})
		}),
		putContent: Celebrate({
			body: Joi.object().keys({
				title: Joi.string().max(200).required(),
				c: Joi.string().max(10000).required(),
				vac: Joi.boolean().required(),
				keywords: Joi.array().items(Joi.string()).required()
			})
		}),
		list: Celebrate({
			query: Joi.object().keys({
				offset:Joi.number().min(0).required(),
				limit:Joi.number().min(5).max(50).required(),
				sort: Joi.string()
			})
		}),
		search: Celebrate({
			query: Joi.object().keys({
				offset:Joi.number().min(0).required(),
				limit:Joi.number().min(5).max(50).required(),
				sort: Joi.string()
			}),
			body: Joi.object().keys({
				keywords: Joi.array().items(Joi.string()).required()
			})
		})
	}
}