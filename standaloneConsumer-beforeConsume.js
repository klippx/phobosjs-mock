/**
 * Standalone consumer app - beforeConsume hook
 *
 * This app consumes the statement_available kafka topic and decodes each message
 * with avro using the account_statement_available avro schema, and persist it
 * to the database as a Statement.
 *
 * Note: Imo the code above reads a bit better, but the point of the concept of beforeConsume
 * is that we might want to normalize messages before persisting them in something like
 * phobos-db-checkpoint. This would be used for phobos-checkpoint-ui with retrying failures or
 * inspecting consumed messages.
 *
 * It also makes testing the consumer easier, separating decoding from consuming. And this means
 * it is easier for phobos-js to export test tools which is a strong feature.
 *
 */
const { createConsumer } = require('phobos')
const { RegistryClient } = require('schema-registry')
const avro = require('avro-js')
const { createStatement } = require('./statement')

let type
const registryClient = new RegistryClient({ port: 1337 })
await registryClient.getLatestSubjectSchema('account_statement_available').then(schema => {
  type = avro.parse(schema)
})

const app = createConsumer({
  topic: 'statement_available',
  beforeConsume: (payload) => {
    return avro.fromBuffer(payload)
  }
})

app.on('messageReceived', (message) => {
  const statement = createStatement(message.data())
})

app.run()
