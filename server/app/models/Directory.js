const path = require('path')
const fs = require('fs')
const { Schema, model } = require('mongoose')
const logger = require('../../config/logger')
const File = require('./File')

const directorySchema = new Schema({
  name: { type: String, required: true },
  parentDirectory: {
    type: Schema.Types.ObjectId,
    ref: 'Directory'
  },
  files: [{
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    default: []
  }],
  directories: [{
    type: Schema.Types.ObjectId,
    ref: 'Directory',
    required: true,
    default: []
  }]
})

const rootDirectoryPath = path.resolve(__dirname, '../../data')

/**
 * @param {object} options
 * @returns {object}
 */
async function getRootDirectory (options) {
  const rootDirectory = await this.findOne({ name: '.' }, options)
  return rootDirectory
}

/**
 * @param {string} relativePath
 * @returns {object}
 */
async function directoriesCreator (relativePath) {
  const directoriesNames = relativePath
    .split(path.sep)
    .filter(directoryName => directoryName !== '' && directoryName !== '.')

  let lastDirectory = await this.getRootDirectory({ directories: true })
  let lastDirectoryPath = rootDirectoryPath

  for (let i = 0; i < directoriesNames.length; i++) {
    const directoryName = directoriesNames[i]
    const directoryPath = path.resolve(lastDirectoryPath, directoryName)

    const directory = await this.findOneOrCreateDirectory(
      lastDirectory, directoryPath, directoryName
    )

    lastDirectory = directory
    lastDirectoryPath = directoryPath
  }

  return lastDirectory
}

/**
 * @param {object} parentDirectory
 * @param {string} directoryPath
 * @param {string} directoryName
 * @returns {object}
 */
async function findOneOrCreateDirectory (
  parentDirectory,
  directoryPath,
  directoryName
) {
  await parentDirectory
    .populate('directories')
    .execPopulate()

  let directory = parentDirectory.directories.find(({ name }) => (
    name === directoryName
  ))

  if (!directory) {
    directory = new this({
      name: directoryName,
      parentDirectory
    })

    await directory.save()
    await parentDirectory.appendDirectory(directory)

    fs.mkdirSync(directoryPath)
  }

  return directory
}

/**
 * @param {object} directory
 */
async function appendDirectory (directory) {
  this.directories = [ ...this.directories, directory ]
  await this.save()
}

/**
 * @param {object} directory
 */
async function appendFile (file) {
  this.files = [ ...this.files, file ]
  await this.save()
}

async function removeDirectory (directoryId) {
  const directoryIndex = this.directories.findIndex(({ id }) => (
    id === directoryId
  ))

  if (directoryIndex > -1) {
    this.directories.splice(directoryIndex, 1)
    await this.save()
  }
}

/**
 * @param {string} fileId
 */
async function removeFile (fileId) {
  const fileIndex = this.files.findIndex(({ id }) => id === fileId)

  if (fileIndex > -1) {
    this.files.splice(fileIndex, 1)
    await this.save()
  }
}

/**
 * @param {string} oldPath
 * @param {string} newName
 */
async function renameDirectory (oldPath, newName) {
  const newPath = oldPath.replace(new RegExp(`${this.name}$`), newName)

  this.name = newName
  await this.save()

  fs.renameSync(oldPath, newPath)
}

/**
 * @param {object} directory
 */
async function deleteDirectory (directoryPath, directory) {
  await directory
    .populate('files')
    .populate('directories')
    .execPopulate()

  for (const file of directory.files) {
    const filePath = path.resolve(directoryPath, file.name)
    await File.deleteFile(filePath, file)
    await directory.removeFile(file.id)
  }

  for (const subDirectory of directory.directories) {
    const subDirectoryPath = path.resolve(directoryPath, subDirectory.name)
    await this.deleteDirectory(subDirectoryPath, subDirectory)
    await directory.removeDirectory(subDirectory.id)
  }

  await directory.remove()
  fs.rmdirSync(directoryPath)
}

// statics properties and methods
directorySchema.statics.rootDirectoryPath = rootDirectoryPath
directorySchema.statics.getRootDirectory = getRootDirectory
directorySchema.statics.directoriesCreator = directoriesCreator
directorySchema.statics.findOneOrCreateDirectory = findOneOrCreateDirectory
directorySchema.statics.deleteDirectory = deleteDirectory

// class properties and methods
directorySchema.methods.appendDirectory = appendDirectory
directorySchema.methods.appendFile = appendFile
directorySchema.methods.removeDirectory = removeDirectory
directorySchema.methods.removeFile = removeFile
directorySchema.methods.renameDirectory = renameDirectory

const Directory = model('Directory', directorySchema)

createRootDirectory()

/**
 * Create root directory if it not exists.
 */
async function createRootDirectory () {
  try {
    let rootDirectory = await Directory.getRootDirectory()

    if (!rootDirectory) {
      rootDirectory = new Directory({ name: '.', parentDirectory: null })

      await rootDirectory.save()
      logger.info('Root directory created successfully')
    }
  } catch (err) {
    logger.error(
      'Something wrong happened while finding ' +
      `or creating root directory: ${err}`
    )

    process.exit(1)
  }
}

module.exports = Directory
