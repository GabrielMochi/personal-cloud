const Joi = require('@hapi/joi')

const fileContentSchema = Joi.object({
  path: Joi.string().required(),
  encoding: Joi.string()
})

module.exports = fileContentSchema
