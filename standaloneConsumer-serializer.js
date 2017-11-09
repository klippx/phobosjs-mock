/**
 * Standalone consumer app - serializer to decode messages before consuming
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

/**
 * Serializer, alternative 1
 */
const app = createConsumer({
  topic: 'statement_available',
  keySerializer: async key => key.toString(),
  valueSerializer: async value => await avro.fromBuffer(value)
})

/**
 * Serializer, alternative 2
 */
const app = createConsumer({
  topic: 'statement_available',
  serializer: async ({ key, value }) => {
    return { key: key.toString(), value: await avro.fromBuffer(value) }
  }
})

app.onMessage(async (message, metadata) => {
  const statement = createStatement(message.data())
})

app.run()
