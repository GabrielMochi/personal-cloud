const { Router } = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const boom = require('boom')
const logger = require('../../config/logger')
const api = require('./api')

const router = Router()

router.use(cors({ origin: true }))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// log the HTTP requests from clients
router.use(morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'tiny',
  { stream: { write: message => logger.info(message) } }
))

router.use('/api', api)

// error middleware
router.use((err, req, res, next) => {
  err = err
    ? (err.isBoom
      ? err
      : boom.badImplementation(err.message || err))
    : boom.badImplementation()

  if (err.isServer) logger.error(err)

  res.status(err.output.statusCode).json(err.output.payload)
})

module.exports = router
