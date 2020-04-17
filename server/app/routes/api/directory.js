const { Router } = require('express')
const DirectoryController = require('../../controllers/DirectoryController')
const { asyncMiddleware } = require('../../utils/middlewares')

const router = Router()

router.get('/', asyncMiddleware(DirectoryController.getDirectory))
router.post('/', asyncMiddleware(DirectoryController.createDirectory))
router.put('/', asyncMiddleware(DirectoryController.renameDirectory))
router.delete('/', asyncMiddleware(DirectoryController.deleteDirectory))

module.exports = router
