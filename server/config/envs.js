const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const defaultEnvFilePath = path.resolve(__dirname, '../../.env')
const defaultLocalEnvFilePath = path.resolve(__dirname, '../../.env.local')

const customEnvFilePath = path.resolve(
  __dirname,
  `../../.env.${process.env.NODE_ENV}`
)

const customLocalEnvFilePath = path.resolve(
  __dirname,
  `../../.env.${process.env.NODE_ENV}.local`
)

function load () {
  if (fs.existsSync(defaultEnvFilePath))
    dotenv.config({ path: defaultEnvFilePath })

  if (fs.existsSync(defaultLocalEnvFilePath))
    dotenv.config({ path: defaultLocalEnvFilePath })

  if (fs.existsSync(customEnvFilePath))
    dotenv.config({ path: customEnvFilePath })

  if (fs.existsSync(customLocalEnvFilePath))
    dotenv.config({ path: customLocalEnvFilePath })
}

exports.load = load
