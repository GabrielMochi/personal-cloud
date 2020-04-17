const Joi = require('@hapi/joi')

const downloadFileSchema = Joi.object({
  path: Joi.string().required()
})

module.exports = downloadFileSchema
