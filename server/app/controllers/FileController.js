const path = require('path')
const fs = require('fs')
const boom = require('boom')
const httpStatusCodes = require('http-status-codes')
const File = require('../models/File')
const Directory = require('../models/Directory')
const fileContentSchema = require('../schemas/fileContentSchema')
const downloadFileSchema = require('../schemas/downloadFileSchema')
const uploadFileSchema = require('../schemas/uploadFileSchema')
const renameFileSchema = require('../schemas/renameFileSchema')
const deleteFileSchema = require('../schemas/deleteFileSchema')
const { AsyncIncomingForm } = require('../utils/formidable')
const logger = require('../../config/logger')

class FileController {

  static async getFile (req, res) {
    const file = await File.findById(req.params.id)

    if (!file)
      throw boom.notFound(
        `File with id "${req.params.id}" does not exists!`
      )

    res.json(file)
  }

  static async getFileContent (req, res) {
    try {
      await fileContentSchema.validateAsync(req.query)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { path: relativeFilePath, encoding } = req.query

    const fullFilePath = path.resolve(
      File.rootDirectoryPath,
      relativeFilePath
    )

    if (!fs.existsSync(fullFilePath))
      throw boom.badRequest(
        `File with path "${fullFilePath} does not exists!"`
      )

    const fileContent = File.getFileContent(fullFilePath, encoding)

    res.type('text/plain').send(fileContent)
  }

  static async downloadFile (req, res) {
    try {
      await downloadFileSchema.validateAsync(req.query)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { path: filePath } = req.query
    const fullFilePath = path.resolve(File.rootDirectoryPath, filePath)

    if (!fs.existsSync(fullFilePath))
      throw boom.badRequest(
        `File path "${filePath}" does not exists!`
      )

    try {
      await downloadAsync(res, fullFilePath)
    } catch (err) {
      logger.error(err)
    }
  }

  static async uploadFile (req, res) {
    try {
      await uploadFileSchema.validateAsync(req.query)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { directoryPath, directoryId } = req.query

    let parentDirectory

    try {
      parentDirectory = await Directory.findById(directoryId)
    } catch (err) {
      throw boom.badRequest(
        `Directory with id "${directoryId}" does not exists!`
      )
    }

    const form = new AsyncIncomingForm()

    const fullDirectoryPath = path.resolve(
      File.rootDirectoryPath,
      directoryPath
    )

    if (!fs.existsSync(fullDirectoryPath))
      throw boom.badRequest(
        `The directory "${directoryPath}" does not exists!`
      )

    form.uploadDir = fullDirectoryPath
    form.multiples = true
    form.keepExtensions = true

    let { files: { data: filesInfo } } = await form.parseAsync(req)

    try {
      if (!Array.isArray(filesInfo))
        filesInfo = [ filesInfo ]

      const files = await File.saveFiles(parentDirectory, filesInfo)
      const filesId = files.map(({ id }) => id)

      res.status(httpStatusCodes.CREATED).json(filesId)
    } catch (err) {
      // if anything goes wrong, then delete the files
      filesInfo.forEach(({ path: filePath }) => (
        fs.unlinkSync(filePath)
      ))

      throw err
    }
  }

  static async renameFile (req, res) {
    try {
      await renameFileSchema.validateAsync(req.body)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { path: filePath, id: fileId, newName } = req.body
    const fullFilePath = path.resolve(File.rootDirectoryPath, filePath)

    if (!fs.existsSync(fullFilePath))
      throw boom.badRequest(
        `File path "${filePath}" does not exists!`
      )

    const file = await File.findById(fileId)

    if (!file)
      throw boom.badRequest(
        `File with id "${fileId}" does not exists!`
      )

    await File.renameFile(file, fullFilePath, newName)
    res.json({ id: fileId })
  }

  static async deleteFile (req, res) {
    try {
      await deleteFileSchema.validateAsync(req.body)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { path: filePath, id: fileId } = req.body
    const fullFilePath = path.resolve(File.rootDirectoryPath, filePath)

    if (!fs.existsSync(fullFilePath))
      throw boom.badRequest(
        `File path "${filePath}" does not exists!`
      )

    const file = await File.findById(fileId)

    if (!file)
      throw boom.badImplementation(
        `File with id "${fileId}" does not exists!`
      )

    await file
      .populate('parentDirectory')
      .execPopulate()

    await file.parentDirectory
      .populate('files')
      .execPopulate()

    await File.deleteFile(fullFilePath, file)
    await file.parentDirectory.removeFile(fileId)

    res.json()
  }

}

/**
 * @param {object} res
 * @param {string} filePath
 * @return {Promise<void>}
 */
function downloadAsync (res, filePath) {
  return new Promise((resolve, reject) => {
    res.download(filePath, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

module.exports = FileController
