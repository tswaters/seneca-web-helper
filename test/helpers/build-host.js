'use strict'

const http = require('http')
const Express = require('express')
const Seneca = require('seneca')
const SenecaWeb = require('seneca-web')
const SenecaWebAdapterExpress = require('seneca-web-adapter-express')
const SenecaRedisTransport = require('seneca-redis-transport-fork')
const { WebHost } = require('../..')

module.exports = async function build_host({port, tag, hostname}) {
  let server = null

  const app = Express()
  const si = Seneca({ log: 'silent', tag })
    .use(SenecaRedisTransport)
    .use(WebHost, {hostname})
    .use(SenecaWeb, {
      adapter: SenecaWebAdapterExpress,
      options: { parseBody: false },
      context: new Express.Router(),
      routes: []
    })

    // provide point->point for web requests
    .client({type: 'tcp', pins: ['role:test,cmd:*']})

  await new Promise((resolve, reject) =>
    si.ready(err => (err ? reject(err) : resolve()))
  )

  si.act('role:web,register:all', { to_hostname: hostname })

  app.use('/api', si.export('web/context')())
  server = http.createServer(app)

  await new Promise((resolve, reject) =>
    server.listen(port, err => (err ? reject(err) : resolve()))
  )

  return { si, server }
}
