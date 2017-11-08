/**
 * Standalone consumer app
 *
 * This app consumes the statement_available kafka topic and decodes each message
 * with avro using the account_statement_available avro schema, and persist it
 * to the database as a Statement.
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

const app = createConsumer({ topic: 'statement_available' })

app.on('messageReceived', (message) => {
  const decodedMessage = avro.fromBuffer(message)
  const statement = createStatement(decodedMessage.data())
})
