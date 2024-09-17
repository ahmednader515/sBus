const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { fullServiceSchema } = require('../schemas');

const ExpressError = require('../utils/ExpressError');
const FullService = require('../models/fullService');
const FullTicket = require('../models/fullTicket');
const {isOwnerLoggedIn, isUserLoggedIn} = require("../middleware");

const validateFullService = (req, res, next) => {
    const { error } = fullServiceSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
        const fullServices = await FullService.find({})
        res.render('fullServices/index', {fullServices})
}));

router.get('/new', isOwnerLoggedIn, (req, res) => {
    res.render('fullServices/new');
})

router.post('/', validateFullService, catchAsync(async (req, res, next) => {
    const fullService = new FullService(req.body.fullService);
    fullService.author = req.user._id
    await fullService.save();
    req.flash('success', 'تم اضافة خدمة جديدة');
    res.redirect(`/fullServices/${fullService._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const fullService = await FullService.findById(req.params.id).populate('author');
    if (!fullService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/services');
    }
    res.render('fullServices/show', { fullService });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const fullService = await FullService.findById(req.params.id)
    if (!fullService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/services');
    }
    res.render('fullServices/edit', { fullService });
}))

router.get('/admins/:id/edit', catchAsync(async (req, res) => {
    const fullService = await FullService.findById(req.params.id)
    if (!fullService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/services');
    }
    res.render('admins/fullServiceEdit', { fullService });
}))

router.put('/:id', validateFullService, catchAsync(async (req, res) => {
    const { id } = req.params;
    const fullService = await FullService.findByIdAndUpdate(id, { ...req.body.fullService });
    req.flash('success', 'تم تعديل الخدمة بنجاح');
    res.redirect(`/fullServices/${fullService._id}`)
}));

router.get('/:id/order', isUserLoggedIn, catchAsync(async (req, res) => {
    const fullService = await FullService.findById(req.params.id)
    if (!fullService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/services');
    }
    res.render('users/fullOrder', { fullService });
}))

router.post('/:id/order', catchAsync(async (req, res) => {
    const fullTicket = new FullTicket(req.body);
    fullTicket.username = req.user.username
    await fullTicket.save();
    req.flash('success', 'تم اضافة تذكرة جديدة');
    res.redirect(`/fullServices/${fullTicket._id}/fullTicket`)
}))

router.get('/:id/fullTicket', catchAsync(async (req, res) => {
    const fullTicket = await FullTicket.findById(req.params.id)
    if (!fullTicket) {
        req.flash('error', 'لا يمكن العثور علي تلك التذكرة');
        return res.redirect('/');
    }
    res.render('users/fullTicket', { fullTicket });
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await FullService.findByIdAndDelete(id);
    req.flash('success', 'تم حذف الخدمة بنجاح')
    res.redirect('/fullServices');
}));

module.exports = router;