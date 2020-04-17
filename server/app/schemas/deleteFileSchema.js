const Joi = require('@hapi/joi')

const deleteFileSchema = Joi.object({
  id: Joi.string().required(),
  path: Joi.string().required()
})

module.exports = deleteFileSchema
