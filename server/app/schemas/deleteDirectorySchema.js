const Joi = require('@hapi/joi')

const deleteDirectorySchema = Joi.object({
  id: Joi.string().required(),
  path: Joi.string().required()
})

module.exports = deleteDirectorySchema
