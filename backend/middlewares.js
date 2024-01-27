module.exports.isLoggedIn = (req, res, next) => {
    console.log(req)
    if (!req.isAuthenticated()) {
        //saving url to redirect
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "please login to continue");
        res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}