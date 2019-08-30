'use strict'

const supertest = require('supertest')
const build_host = require('./helpers/build-host')
const build_client = require('./helpers/build-client')

describe('integration tests', () => {
  describe('host first, then client', () => {
    let host = null
    let client = null
    let server = null

    beforeEach(async () => {
      ;({ si: host, server } = await build_host({
        port: 3005,
        tag: 'host',
        hostname: 'host1'
      }))
      ;({ si: client } = await build_client({
        port: 10101,
        tag: 'client',
        hostname: 'client1'
      }))
    })

    afterEach(async () => {
      await new Promise(resolve => host.close(resolve))
      await new Promise(resolve => server.close(resolve))
      await new Promise(resolve => client.close(resolve))
    })

    it('should work properly', () =>
      supertest(server)
        .get('/api/foo')
        .expect(200))
  })

  describe('client first, then host', () => {
    let host = null
    let client = null
    let server = null

    beforeEach(async () => {
      ;({ si: client } = await build_client({
        port: 10101,
        tag: 'client',
        hostname: 'client1'
      }))
      ;({ si: host, server } = await build_host({
        tag: 'host',
        port: 3006,
        hostname: 'host1'
      }))
    })

    afterEach(async () => {
      await new Promise(resolve => host.close(resolve))
      await new Promise(resolve => server.close(resolve))
      await new Promise(resolve => client.close(resolve))
    })

    it('should work properly', () => {
      supertest(server)
        .get('/api/foo')
        .expect(200)
    })
  })

  describe('one client, multiple hosts', () => {
    let host1 = null
    let host2 = null
    let host3 = null
    let server1 = null
    let server2 = null
    let server3 = null
    let client = null

    beforeEach(async () => {
      ;({ si: client } = await build_client({
        port: 10101,
        tag: 'client1',
        hostname: 'client1'
      }))
      ;({ si: host1, server: server1 } = await build_host({
        port: 3006,
        tag: 'host',
        hostname: 'host1'
      }))
      ;({ si: host2, server: server2 } = await build_host({
        port: 3007,
        tag: 'host',
        hostname: 'host2'
      }))
      ;({ si: host3, server: server3 } = await build_host({
        port: 3008,
        tag: 'host',
        hostname: 'host3'
      }))
    })

    afterEach(async () => {
      await new Promise(resolve => host1.close(resolve))
      await new Promise(resolve => host2.close(resolve))
      await new Promise(resolve => host3.close(resolve))
      await new Promise(resolve => server1.close(resolve))
      await new Promise(resolve => server2.close(resolve))
      await new Promise(resolve => server3.close(resolve))
      await new Promise(resolve => client.close(resolve))
    })

    it('should work properly', async () => {
      await supertest(server1)
        .get('/api/foo')
        .expect(200)
      await supertest(server2)
        .get('/api/foo')
        .expect(200)
      await supertest(server3)
        .get('/api/foo')
        .expect(200)
    })
  })

  describe('one host, multiple clients', () => {
    let host = null
    let client1 = null
    let client2 = null
    let client3 = null
    let server = null

    beforeEach(async () => {
      ;({ si: host, server } = await build_host({
        port: 3006,
        tag: 'host',
        hostname: 'host1'
      }))
      ;({ si: client1 } = await build_client({
        port: 10101,
        tag: 'client',
        hostname: 'client1'
      }))
      ;({ si: client2 } = await build_client({
        port: 10102,
        tag: 'client',
        hostname: 'client2'
      }))
      ;({ si: client3 } = await build_client({
        port: 10103,
        tag: 'client',
        hostname: 'client3'
      }))
    })

    afterEach(async () => {
      await new Promise(resolve => host.close(resolve))
      await new Promise(resolve => server.close(resolve))
      await new Promise(resolve => client1.close(resolve))
      await new Promise(resolve => client2.close(resolve))
      await new Promise(resolve => client3.close(resolve))
    })

    it('should work properly', async () => {
      await supertest(server)
        .get('/api/foo')
        .expect(200)
    })
  })

  describe('clearing cache', () => {
    let host = null
    let client1 = null
    let client2 = null
    let client3 = null
    let server = null

    beforeEach(async () => {
      ;({ si: host, server } = await build_host({
        port: 3006,
        tag: 'host',
        hostname: 'host1'
      }))
      ;({ si: client1 } = await build_client({
        port: 10101,
        tag: 'client',
        hostname: 'client1'
      }))
      ;({ si: client2 } = await build_client({
        port: 10102,
        tag: 'client',
        hostname: 'client2'
      }))
      ;({ si: client3 } = await build_client({
        port: 10103,
        tag: 'client',
        hostname: 'client3'
      }))
    })

    afterEach(async () => {
      await new Promise(resolve => host.close(resolve))
      await new Promise(resolve => server.close(resolve))
      await new Promise(resolve => client1.close(resolve))
      await new Promise(resolve => client2.close(resolve))
      await new Promise(resolve => client3.close(resolve))
    })

    it('should work properly', async () => {
      await new Promise((resolve, reject) =>
        host.act('role:web,clear:all', err => (err ? reject(err) : resolve()))
      )

      await supertest(server)
        .get('/api/foo')
        .expect(200)
    })
  })
})
