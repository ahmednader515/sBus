const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo, isAdminLoggedIn } = require('../middleware');
const Package = require('../models/package');
const FullService = require('../models/fullService');
const HalfService = require('../models/halfService');
const Admin = require('../models/admin');

router.get('/dashboard', isAdminLoggedIn, catchAsync(async (req, res) => {
    const packages = await Package.find({});
    const fullServices = await FullService.find({});
    const halfServices = await HalfService.find({});
    res.render('other/admin-dashboard', { packages, fullServices, halfServices })
}));

router.get("/login", (req, res) => {
    res.render("admins/login")
})

router.post("/login", storeReturnTo, passport.authenticate('admin-local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash("success", "اهلا بعودتك")
    const redirectUrl = res.locals.returnTo || '/admins/dashboard'
    delete res.locals.returnTo
    res.redirect(redirectUrl)
})

router.get('/register', (req, res) => {
    res.render('admins/register')
})

router.post("/register", catchAsync(async (req, res) => {
    try {
    const {email, username, password} = req.body
    const admin = new Admin({email, username})
    const registeredAdmin = await Admin.register(admin, password)
    req.login(registeredAdmin, err => {
        if(err) return next(err)
        req.flash('success', 'مرحبا بك')
        res.redirect("/admins/dashboard")
    })
    } catch(error) {
        req.flash('error', error.message)
        res.redirect('/admins/register')
    }
}))

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