# Seneca-Web-Helper

Two useful plugins for using seneca-web in a distributed manner.

This uses the magic of redis-pubsub and fire/forget mechanisms to mount routes when services come online.

The goal here is to stop excessive routes from being mounted to the target host server, and to ensure resilisiancy when new hosts or clients come online.

This plugins acts as a proxy to `seneca-web` calls, and uses redis pubsub to ensure all hosts receive all routes only when they need to.

## Important Notes

* the `seneca-redis-transport` transport is currently broken. Use `seneca-redis-transport-fork`

* the cache mechanism is based upon the tag of each client microservice - this must be set.

* hostname defaults to the OS's hostname and is used to ensure targetted population of routes for each host under a given hostname - if this is the same for multiple hosts, you'll end up with a lot of noise.

### Host

```js
const to_hostname = require('os').hostname()
const Express = require('express')
const Seneca = require('seneca')
const SenecaWeb = require('seneca-web')
const {WebHost} = require('seneca-web-helper')
const SenecaRedisTransport = require('seneca-redis-transport-fork')

const app = Express()
const server = http.createServer(app)

Seneca({ tag: 'api-gateway' })

	.use(SenecaRedisTransport)

  .use(SenecaWeb, {
    adapter: 'express',
    options: {parseBody: false},
    context: new Express.Router(),
    routes: []
  }))

  .use(WebHost)

  // you need to provide some kind of point->point mechanism for web requests
  .client({type: 'tcp', pins: ['role:test,cmd:*']})

  .ready(function () {

      this.act('role:web,register:all', {to_hostname}) // this is the magic

      app.use('/api', this.export('web/context')())

      server.listen(3000, () => this.log.info('api gateway listening!'))

  })
```

### Client

```js
const Seneca = require('seneca')
const SenecaWeb = require('seneca-web')
const {WebClient} = require('seneca-web-helper')
const SenecaRedisTransport = require('seneca-redis-transport-fork')

Seneca({tag: 'microservice-1'})

  .use(SenecaRedisTransport)

	.use(WebClient, {
		routes: [{
      pin: 'role:test,cmd:*',
      map: {test: true}
    }]
  })

  // you need to provide some kind of point->point mechanism for web requests
  .listen({type: 'tcp', pins: ['role:test,cmd:*']})
  .add('role:test,cmd:foo', (args, cb) => cb(null, {ok: true}))

  .ready(function () {
    this.act('role:web,register:unique-name') // this is the magic
    this.log.info('microservice ready!')
  })
```
