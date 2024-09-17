const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { packageSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const Package = require('../models/package.js');
const PackageTicket = require('../models/packageTicket.js');
const {isOwnerLoggedIn, isUserLoggedIn} = require("../middleware")

const validatePackage = (req, res, next) => {
    const { error } = packageSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
        const packages = await Package.find({})
        res.render('packages/index', {packages})
}));

router.get('/new', isOwnerLoggedIn, (req, res) => {
    res.render('packages/new');
})

router.post('/', validatePackage, catchAsync(async (req, res, next) => {
    const package = new Package(req.body.package);
    package.author = req.user._id
    await package.save();
    req.flash('success', 'تم اضافة خدمة جديدة');
    res.redirect(`/packages/${package._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const package = await Package.findById(req.params.id).populate('author');
    if (!package) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/packages');
    }
    res.render('packages/show', { package });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const package = await Package.findById(req.params.id)
    if (!package) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/packages');
    }
    res.render('packages/edit', { package });
}))

router.get('/admins/:id/edit', catchAsync(async (req, res) => {
    const package = await Package.findById(req.params.id)
    if (!package) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/packages');
    }
    res.render('admins/packageEdit', { package });
}))

router.put('/:id', validatePackage, catchAsync(async (req, res) => {
    const { id } = req.params;
    const package = await Package.findByIdAndUpdate(id, { ...req.body.package });
    req.flash('success', 'تم تعديل الخدمة بنجاح');
    res.redirect(`/packages/${package._id}`)
}));

router.get('/:id/order', isUserLoggedIn, catchAsync(async (req, res) => {
    const package = await Package.findById(req.params.id)
    if (!package) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/packages');
    }
    res.render('users/packageOrder', { package });
}))

router.post('/:id/order', catchAsync(async (req, res) => {
    const packageTicket = new PackageTicket(req.body);
    packageTicket.username = req.user.username
    await packageTicket.save();
    req.flash('success', 'تم اضافة تذكرة جديدة');
    res.redirect(`/packages/${packageTicket._id}/packageTicket`)
}))

router.get('/:id/packageTicket', catchAsync(async (req, res) => {
    const packageTicket = await PackageTicket.findById(req.params.id)
    if (!packageTicket) {
        req.flash('error', 'لا يمكن العثور علي تلك التذكرة');
        return res.redirect('/');
    }
    res.render('users/packageTicket', { packageTicket });
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Package.findByIdAndDelete(id);
    req.flash('success', 'تم حذف الخدمة بنجاح')
    res.redirect('/packages');
}));

module.exports = router;