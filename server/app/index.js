const express = require('express')
const mongoose = require('mongoose')
const logger = require('../config/logger')
const routes = require('./routes')

const app = express()

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
  .then(() => (
    logger.info('MongoDB connection succeed')
  ))
  .catch((err) => {
    logger.error(`MongoDB connection failed: ${err}`)
  })

app.use('/', routes)

module.exports = app
