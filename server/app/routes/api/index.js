const { Router } = require('express')
const directory = require('./directory')
const file = require('./file')

const router = Router()

router.use('/directory', directory)
router.use('/file', file)

router.get('/', (req, res) => {
  res.json('API v.1.0.0')
})

module.exports = router
