// IMAGINATION STATION SERVER V 0.1
//ALL CODE UNLESS OTHERWISE SPECIFIED IS WRITTEN BY EDUARDO DE LUNA
var http = require("http");
var url = require("url");
var express = require('express');
var Redis = require('ioredis');
var cors = require('cors');
var pg = require("pg");
var mongoose = require("mongoose");
var pgpool = new pg.Pool({
	connectionString: process.env.DATABASE_URL
});
var forceSSL = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};
var path = require("path"),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
mongoose = require("mongoose"),
session = require('express-session'),
passport = require('passport'),
strategy = require("./libs/passport.js")(passport,pgpool),
session = require("express-session"),
Celebrate = require('celebrate');
var app = express();
require("./libs/passportcallback.js")(app,passport);
require("./routes/index.js")(app, pgpool);
require("./routes/doc.js")(app, pgpool);
require("./routes/job.js")(app, pgpool);
require("./routes/rev.js")(app, pgpool);
require("./routes/newsletter.js")(app, pgpool);
require("./routes/test.js")(app, pgpool);
require("./routes/conversion.js")(app, red);
var red = new Redis(process.env.REDIS_URL)
app.set('port', (process.env.PORT || 5000));
app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({ secret: 'RJhKsjVzUnCkwTYIJN-IKdPn6R-mLpU0GbxUAfPvBTnpOsBbYqYpzCWwnM9Zw2sn', resave: false,  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(forceSSL);
app.use("/static",express.static(__dirname + '/build'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(Celebrate.errors());

mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (err) throw err;
    console.log("MONGO CONNECTION SUCCESS");
    http.createServer(app).listen(app.get('port'), () => console.log('All is quiet in the western port', app.get('port')));
});
