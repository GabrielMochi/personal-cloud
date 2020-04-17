const path = require('path')
const winston = require('winston')

const infoLogFilePath = path.resolve(__dirname, '../logs/info.log')
const errorLogFilePath = path.resolve(__dirname, '../logs/error.log')

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: infoLogFilePath,
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: errorLogFilePath,
      format: winston.format.simple(),
      handleExceptions: true
    })
  ]
})

module.exports = logger
