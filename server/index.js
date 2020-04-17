require('./config/envs').load()

const http = require('http')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const app = require('./app')
const logger = require('./config/logger')

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  const server = http.createServer(app)

  // Listen the server
  server.listen(port, host, () => {
    logger.info(`Server listening on http://${host}:${port}`)
  })
}

start()
