const fs = require('fs')
const path = require('path')
const { Schema, model } = require('mongoose')

const fileSchema = new Schema({
  name: { type: String, required: true },
  parentDirectory: {
    type: Schema.Types.ObjectId,
    ref: 'Directory',
    required: true
  }
})

const rootDirectoryPath = path.resolve(__dirname, '../../data')

/**
 * @param {string} filePath
 * @param {string} encoding
 * @returns {string|Buffer}
 */
function getFileContent (filePath, encoding = 'utf8') {
  const fileContent = fs.readFileSync(filePath, encoding)
  return fileContent
}

/**
 * @param {object} parentDirectory
 * @param {object} filesInfo
 * @returns {object}
 */
async function saveFiles (parentDirectory, filesInfo) {
  const files = []

  for (const fileInfo of filesInfo) {
    const oldFilePath = fileInfo.path
    const newFileName = fileInfo.name
    const newFilePath = replaceFileBasename(oldFilePath, newFileName)

    if (fs.existsSync(newFilePath)) {
      await parentDirectory
        .populate('files')
        .execPopulate()

      const oldFile = parentDirectory.files.find(({ name }) => (
        name === newFileName
      ))

      if (oldFile) {
        await oldFile.remove()
        await parentDirectory.removeFile(oldFile.id)
      }
    }

    fs.renameSync(oldFilePath, newFilePath)

    const file = new this({
      name: fileInfo.name,
      parentDirectory
    })

    await file.save()
    await parentDirectory.appendFile(file)

    files.push(file)
  }

  return files
}

/**
 * @param {object} file
 * @param {string} filePath
 * @param {string} newName
 * @returns {void}
 */
async function renameFile (file, filePath, newName) {
  const newFilePath = replaceFileBasename(filePath, newName)

  file.name = newName
  await file.save()

  fs.renameSync(filePath, newFilePath)
}

/**
 * @param {string} filePath
 * @param {object} file
 * @returns {void}
 */
async function deleteFile (filePath, file) {
  await file.remove()
  fs.unlinkSync(filePath)
}

// private methods

/**
 * @param {string} filePath
 * @param {string} basename
 * @returns {string}
 */
function replaceFileBasename (filePath, basename) {
  const oldFileName = path.basename(filePath)

  const newFilePath = filePath.replace(
    new RegExp(`${oldFileName}$`),
    basename
  )

  return newFilePath
}

// static properties and methods
fileSchema.statics.rootDirectoryPath = rootDirectoryPath
fileSchema.statics.getFileContent = getFileContent
fileSchema.statics.saveFiles = saveFiles
fileSchema.statics.renameFile = renameFile
fileSchema.statics.deleteFile = deleteFile

const File = model('File', fileSchema)

module.exports = File
