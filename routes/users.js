const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo, isUserLoggedIn, isAdminLoggedIn, isOwnerLoggedIn } = require('../middleware');

const accountTypes = ['user', 'admin', 'owner']

router.get('/dashboard', isUserLoggedIn, catchAsync(async (req, res) => {
    res.render('dashboards/user-dashboard')
}));

router.get('/admins/dashboard', isAdminLoggedIn, catchAsync(async (req, res) => {
    res.render('dashboards/admin-dashboard')
}));

router.get('/owners/dashboard', isOwnerLoggedIn, catchAsync(async (req, res) => {
    res.render('dashboards/dashboard')
}));

router.get("/login", (req, res) => {
    if(req.user.type === 'user') {
        res.redirect('/dashboard')
    }else if (req.user.type === 'admin') {
        res.redirect('/admins/dashboard')
    } else if (req.user.type === 'owner') {
        res.redirect('/owners/dashboard')
    }
    res.render("users/login")
})

router.post("/login", storeReturnTo, passport.authenticate('user-local', {
    failureFlash: true, 
    failureRedirect: '/'
}), (req, res) => {
    if(req.user.type === 'user') {
        req.flash("success", "مرحبا بك");
        const redirectUrl = res.locals.returnTo || '/dashboard';
        delete res.locals.returnTo;
        res.redirect(redirectUrl);
    } else if(req.user.type === 'admin') {
        req.flash("success", "مرحبا بك");
        const redirectUrl = res.locals.returnTo || '/admins/dashboard';
        delete res.locals.returnTo;
        res.redirect(redirectUrl);
    } else if(req.user.type === 'owner') {
        req.flash("success", "مرحبا بك");
        const redirectUrl = res.locals.returnTo || '/owners/dashboard';
        delete res.locals.returnTo;
        res.redirect(redirectUrl);
    }
});

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post("/register", catchAsync(async (req, res) => {
    try {
        const { username, name, password } = req.body;
        const user = new User({ username, name });
        user.type = req.body.type; // Add the user type from the form
        const registeredUser = await User.register(user, password); // Passport's register method
        registeredUser.save()
        req.flash('success', 'تم اضافة موظف بنجاح');
        res.redirect("/register");
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
}));

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'نراك لاحقا');
        res.redirect('/');
    });
});

module.exports = router