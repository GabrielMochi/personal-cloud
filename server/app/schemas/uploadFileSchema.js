const Joi = require('@hapi/joi')

const uploadFileSchema = Joi.object({
  directoryPath: Joi.string().required(),
  directoryId: Joi.string().required()
})

module.exports = uploadFileSchema
