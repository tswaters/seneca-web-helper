const os_hostname = require('os').hostname()

module.exports = function WebHostPlugin({ hostname = os_hostname }) {
  const name = 'WebHostPlugin'
  let cache = {}

  const { tag } = this.options()
  this.log.debug(name, tag, 'init')

  this.client({
    type: 'redis',
    pins: ['role:web,register:*']
  })

  this.listen({
    type: 'redis',
    pins: ['role:web,set:routes']
  })

  this.add('role:web,set:routes', function(args, cb) {
    this.log.debug(name, 'role:web,set:routes')

    const { to_hostname, routes, tag } = args

    if (to_hostname && to_hostname !== hostname) {
      return cb(null, { ok: true })
    }

    if (cache[tag] != null) {
      return cb(null, { ok: true })
    }

    cache[tag] = true
    this.log.debug('calling into seneca-web')
    this.act('role:web', { routes }, cb)
  })

  this.add('role:web,clear:all', function(args, cb) {
    this.log.debug(name, 'role:web,clear:all')
    cache = {}
    this.act('role:web', { register: 'all', to_hostname: hostname })
    cb()
  })

  return { name }
}
