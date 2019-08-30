'use strict'

const Seneca = require('seneca')
const SenecaRedisTransport = require('seneca-redis-transport-fork')
const { WebClient } = require('../../')

module.exports = async function build_client({port, tag, hostname}) {
  const si = Seneca({ log: 'silent', tag })
    .use(SenecaRedisTransport)
    .use(WebClient, {
      hostname,
      routes: [
        {pin: 'role:test,cmd:*', map: {foo: true}
      }]
    })

    // provide point->point for web requests
    .listen({type: 'tcp', port, pins: ['role:test,cmd:*']})
    .add('role:test,cmd:foo', (args, cb) => cb(null, {ok: true}))

  await new Promise((resolve, reject) =>
    si.ready(err => (err ? reject(err) : resolve()))
  )

  await new Promise((resolve, reject) =>
    si.act(`role:web`, {register: tag}, err =>
      err ? reject(err) : resolve()
    )
  )

  return { si }
}
