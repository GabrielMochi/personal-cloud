const Joi = require('@hapi/joi')

const renameFileSchema = Joi.object({
  path: Joi.string().required(),
  id: Joi.string().required(),
  newName: Joi.string().required()
})

module.exports = renameFileSchema
