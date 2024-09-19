const express = require("express")
const router = express.Router()
const Owner = require("../models/owner")
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo, isOwnerLoggedIn } = require('../middleware');
const Package = require('../models/package');
const FullService = require('../models/fullService');
const HalfService = require('../models/halfService');
const User = require('../models/user');


router.get('/dashboard', isOwnerLoggedIn, catchAsync(async (req, res) => {
    const packages = await Package.find({});
    const fullServices = await FullService.find({});
    const halfServices = await HalfService.find({});
    res.render('other/dashboard', {  packages, fullServices, halfServices })
}));

router.get("/login", (req, res) => {
    res.render("owners/login")
})

router.post("/login", storeReturnTo, passport.authenticate('owner-local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash("success", "اهلا بعودتك")
    const redirectUrl = res.locals.returnTo || '/owners/dashboard'
    delete res.locals.returnTo
    res.redirect(redirectUrl)
})

router.get('/register', (req, res) => {
    res.render('owners/register')
})

router.post("/register", catchAsync(async (req, res) => {
    try {
    const {email, username, password} = req.body
    const owner = new User({email, username})
    owner.type = 'Owner'
    const registeredOwner = await User.register(owner, password)
    req.login(registeredOwner, err => {
        if(err) return next(err)
        req.flash('success', 'مرحبا بك')
        res.redirect("/owners/dashboard")
    })
    } catch(error) {
        req.flash('error', error.message)
        res.redirect('/login')
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