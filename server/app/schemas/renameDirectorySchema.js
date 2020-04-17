const Joi = require('@hapi/joi')

const renameDirectorySchema = Joi.object({
  id: Joi.string().required(),
  path: Joi.string().required(),
  newName: Joi.string().required()
})

module.exports = renameDirectorySchema
