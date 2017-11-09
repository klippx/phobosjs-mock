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

app.onMessage(async (message, metadata) => {
  // metadata => { retryCount, retryTime, etc }
  const decodedMessage = avro.fromBuffer(message)
  const statement = createStatement(decodedMessage.data())
})

/**
 * If anything goes wrong in the client onMessage callback (or even kafkajs/phobos internals)
 * this is the standard way of handling these errors.
 * Note that with something like checkPoint interface, errors could potentially be handled
 * there as well...
 */
app.onError(async error => {
  console.log('Error happened, deal with it', error)
})

app.run()
