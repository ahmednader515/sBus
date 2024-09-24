const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

const isAuthenticated = (req, res, next, role, redirectUrl, errorMessage) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl || redirectUrl;
        req.flash('error', errorMessage);
        return res.redirect(redirectUrl);
    }
    next();
};

const isUserLoggedIn = (req, res, next) => {
    isAuthenticated(req, res, next, 'user', '/login', 'يجب عليك تسجيل الدخول اولا');
};

const isAdminLoggedIn = (req, res, next) => {
    isAuthenticated(req, res, next, 'user', '/login', 'يجب عليك تسجيل الدخول اولا');
};

const isOwnerLoggedIn = (req, res, next) => {
    isAuthenticated(req, res, next, 'user', '/login', 'يجب عليك تسجيل الدخول اولا');
};

module.exports = {
    storeReturnTo,
    isUserLoggedIn,
    isAdminLoggedIn,
    isOwnerLoggedIn,
};