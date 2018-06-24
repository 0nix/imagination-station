module.exports = (app, passport) => { 
    app.get('/securecallback', passport.authenticate('auth0',
        { failureRedirect: '/fail' }), (req, res) => {
            if (!req.user) {
                throw new Error('user null');
            }
            res.redirect("/home");
    });
};