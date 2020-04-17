const path = require('path')
const fs = require('fs')
const boom = require('boom')
const httpsStatus = require('http-status-codes')
const Directory = require('../models/Directory')
const createDirectorySchema = require('../schemas/createDirectorySchema')
const renameDirectorySchema = require('../schemas/renameDirectorySchema')
const deleteDirectorySchema = require('../schemas/deleteDirectorySchema')

class DirectoryController {

  static async getDirectory (req, res) {
    const directory = req.query.id
      ? await Directory.findById(req.query.id)
      : await Directory.getRootDirectory()

    if (!directory)
      throw boom.notFound(
        `Directory with id "${req.query.id}" does not exists!`
      )

    res.json(directory)
  }

  static async createDirectory (req, res) {
    try {
      await createDirectorySchema.validateAsync(req.body)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { path: directoryPath } = req.body

    const directoryFullPath = path.resolve(
      Directory.rootDirectoryPath,
      directoryPath
    )

    if (fs.existsSync(directoryFullPath))
      throw boom.badRequest(
        `The directory ${directoryPath} already exists!`
      )

    const directory = await Directory.directoriesCreator(directoryPath)
    res.status(httpsStatus.CREATED).json({ id: directory.id })
  }

  static async renameDirectory (req, res) {
    try {
      await renameDirectorySchema.validateAsync(req.body)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { id, path: directoryPath, newName } = req.body
    const directory = await Directory.findById(id)

    if (!directory)
      throw boom.badRequest(`Directory with id "${id}" does not exists!`)

    const oldPath = path.resolve(Directory.rootDirectoryPath, directoryPath)

    if (!fs.existsSync(oldPath))
      throw boom.badRequest(
        `Directory with path "${directoryPath}" does not exists!`
      )

    await directory.renameDirectory(oldPath, newName)

    res.json({ id: directory.id })
  }

  static async deleteDirectory (req, res) {
    try {
      await deleteDirectorySchema.validateAsync(req.body)
    } catch (err) {
      throw boom.badRequest(err.message)
    }

    const { id, path: relativeDirectoryPath } = req.body

    const directory = await Directory.findById(id)

    if (!directory)
      throw boom.badRequest(`Directory with id "${id}" does not exists!`)

    const fullDirectoryPath = path.resolve(
      Directory.rootDirectoryPath,
      relativeDirectoryPath
    )

    await Directory.deleteDirectory(fullDirectoryPath, directory)
    res.json()
  }

}

module.exports = DirectoryController
