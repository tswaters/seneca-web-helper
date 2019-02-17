const os_hostname = require('os').hostname()

module.exports = function WebClientPlugin({ routes, hostname = os_hostname }) {
  const name = 'WebClientPlugin'
  const { tag } = this.options()

  this.log.debug(name, tag, 'init')

  this.listen({
    type: 'redis',
    pins: ['role:web,register:*']
  })

  this.client({
    type: 'redis',
    pins: ['role:web,set:routes']
  })

  this.add(`role:web,register:${tag}`, function(msg, cb) {
    this.log.debug(name, 'register', tag)
    const { to_hostname = null } = msg
    const from_hostname = hostname

    this.act('role:web,set:routes', {
      tag,
      to_hostname,
      from_hostname,
      routes
    })

    cb()
  })

  this.add('role:web,register:all', function(msg, cb) {
    this.log.debug(name, 'register:all')
    const { to_hostname } = msg
    const from_hostname = hostname
    this.act('role:web,set:routes', {
      tag,
      to_hostname,
      from_hostname,
      routes
    })

    cb()
  })

  return { name }
}
