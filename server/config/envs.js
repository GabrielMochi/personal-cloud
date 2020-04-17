const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const defaultEnvFilePath = path.resolve(__dirname, '../../.env')

const customEnvFilePath = path.resolve(
  __dirname,
  `../../.env.${process.env.NODE_ENV}`
)

function load () {
  if (fs.existsSync(defaultEnvFilePath))
    dotenv.config({ path: defaultEnvFilePath })

  if (fs.existsSync(customEnvFilePath))
    dotenv.config({ path: customEnvFilePath })
}

exports.load = load
