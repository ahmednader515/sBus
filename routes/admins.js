const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo, isAdminLoggedIn } = require('../middleware');
const Package = require('../models/package');
const FullService = require('../models/fullService');
const HalfService = require('../models/halfService');
const Admin = require('../models/admin');
const User = require('../models/user');

router.get('/dashboard', isAdminLoggedIn, catchAsync(async (req, res) => {
    const packages = await Package.find({});
    const fullServices = await FullService.find({});
    const halfServices = await HalfService.find({});
    res.render('other/admin-dashboard', { packages, fullServices, halfServices })
}));

router.post("/register", catchAsync(async (req, res) => {
    try {
    const {username, password} = req.body
    const admin = new User({username})
    admin.type = req.body.type
    const registeredAdmin = await User.register(admin, password)
    req.login(registeredAdmin, err => {
        if(err) return next(err)
        req.flash('success', 'مرحبا بك')
        res.redirect("/admins/dashboard")
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