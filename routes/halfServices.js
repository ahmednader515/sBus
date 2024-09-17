const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { halfServiceSchema } = require('../schemas');

const ExpressError = require('../utils/ExpressError');
const HalfService = require('../models/halfService');
const HalfTicket = require('../models/halfTicket')
const {isOwnerLoggedIn, isUserLoggedIn} = require("../middleware")

const validateHalfService = (req, res, next) => {
    const { error } = halfServiceSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
        const halfServices = await HalfService.find({})
        res.render('halfServices/index', {halfServices})
}));

router.get('/new', isOwnerLoggedIn, (req, res) => {
    res.render('halfServices/new');
})

router.post('/', validateHalfService, catchAsync(async (req, res, next) => {
    const halfService = new HalfService(req.body.halfService);
    halfService.author = req.user._id
    await halfService.save();
    req.flash('success', 'تم اضافة خدمة جديدة');
    res.redirect(`/halfServices/${halfService._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const halfService = await HalfService.findById(req.params.id).populate('author');
    if (!halfService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/halfServices');
    }
    res.render('halfServices/show', { halfService });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const halfService = await HalfService.findById(req.params.id)
    if (!halfService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/halfServices');
    }
    res.render('halfServices/edit', { halfService });
}))

router.get('/admins/:id/edit', catchAsync(async (req, res) => {
    const halfService = await HalfService.findById(req.params.id)
    if (!halfService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/services');
    }
    res.render('admins/halfServiceEdit', { halfService });
}))

router.put('/:id', validateHalfService, catchAsync(async (req, res) => {
    const { id } = req.params;
    const halfService = await HalfService.findByIdAndUpdate(id, { ...req.body.halfService });
    req.flash('success', 'تم تعديل الخدمة بنجاح');
    res.redirect(`/halfServices/${halfService._id}`)
}));

router.get('/:id/order', isUserLoggedIn, catchAsync(async (req, res) => {
    const halfService = await HalfService.findById(req.params.id)
    if (!halfService) {
        req.flash('error', 'لا يمكن العثور علي تلك الخدمة');
        return res.redirect('/services');
    }
    res.render('users/halfOrder', { halfService });
}))

router.post('/:id/order', catchAsync(async (req, res) => {
    const halfTicket = new HalfTicket(req.body);
    halfTicket.username = req.user.username
    await halfTicket.save();
    req.flash('success', 'تم اضافة تذكرة جديدة');
    res.redirect(`/halfServices/${halfTicket._id}/halfTicket`)
}))

router.get('/:id/halfTicket', catchAsync(async (req, res) => {
    const halfTicket = await HalfTicket.findById(req.params.id)
    if (!halfTicket) {
        req.flash('error', 'لا يمكن العثور علي تلك التذكرة');
        return res.redirect('/');
    }
    res.render('users/halfTicket', { halfTicket });
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await HalfService.findByIdAndDelete(id);
    req.flash('success', 'تم حذف الخدمة بنجاح')
    res.redirect('/halfServices');
}));

module.exports = router;