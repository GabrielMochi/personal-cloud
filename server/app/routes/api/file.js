const { Router } = require('express')
const FileController = require('../../controllers/FileController')
const { asyncMiddleware } = require('../../utils/middlewares')

const router = Router()

router.get('/:id', asyncMiddleware(FileController.getFile))
router.get('/:id/content', asyncMiddleware(FileController.getFileContent))
router.get('/:id/download', asyncMiddleware(FileController.downloadFile))
router.post('/', asyncMiddleware(FileController.uploadFile))
router.put('/', asyncMiddleware(FileController.renameFile))
router.delete('/', asyncMiddleware(FileController.deleteFile))

module.exports = router
