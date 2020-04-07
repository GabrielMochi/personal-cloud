import { resolve } from 'path'
import { Nuxt, Builder } from 'nuxt'

let nuxt = null

beforeAll(async () => {
  const config = {
    dev: false,
    rootDir: resolve(__dirname, '..')
  }

  nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await new Builder(nuxt).build()
  return await nuxt.server.listen(port, host)
}, 30000)

describe('GET /', () => {
  test('Route / exists', async () => {
    const { error } = await nuxt.server.renderRoute('/', {})
    expect(error).toBeFalsy()
  })
})

afterAll(() => {
  nuxt.close()
})
