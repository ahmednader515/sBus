const Joi = require('joi');
const { number } = require('joi');

module.exports.packageSchema = Joi.object({
    package: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string(),
        location: Joi.string(),
        description: Joi.string(),
    }).required()
});

module.exports.fullServiceSchema = Joi.object({
    fullService: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string(),
        location: Joi.string(),
        description: Joi.string(),
    }).required()
});

module.exports.halfServiceSchema = Joi.object({
    halfService: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string(),
        location: Joi.string(),
        description: Joi.string(),
    }).required()
});