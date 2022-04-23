const { createClient } = require('redis')

function initClient () {

  const client = createClient()
  client.on('error', (err) => console.log('Redis Client Error', err))

  return client
  /*await client.set('key', 'value')
  const value = await client.get('key')*/
}

module.exports = initClient()