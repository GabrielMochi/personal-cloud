const Joi = require('@hapi/joi')

const createDirectorySchema = Joi.object({
  path: Joi.string().required()
})

module.exports = createDirectorySchema
