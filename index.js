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


/**
 * Producer app in express
 *
 * This app has an endpoint for creating todos, and for each todo that
 * it receives it posts it to kafka topic :todo_created for any downstream
 * system to consume it.
 *
 */
const { createProducer } = require('phobos')
const app = express()
const producer = createProducer({ topic: 'todo_created' })
const { createTodo } = require('./todo')

app.post('/v1/todo', (req, res) => {
  const todo = await createTodo(req.params)

  producer.publish({
    id: todo.uuid,
    label: todo.label,
  })

  res.sendStatus(201)
}



/**
 * Producer app used in klappService
 *
 * This app has an endpoint for creating todos, and for each todo that
 * it receives it posts it to kafka topic :todo_created for any downstream
 * system to consume it.
 *
 * This app uses the klappService
 *
 */
const { KlappService } = require('@klarna/klapp-service')
const { createProducer } = require('phobos')
const { Router } = require('express')

const klappService = KlappService()
const producer = createProducer({ topic: 'todo_created' })

const todoAction = async (req, res) => {
  const todo = await createTodo(req.params)

  producer.publish({
    id: todo.uuid,
    label: todo.label,
  })

  res.sendStatus(201)
}

function createHandlers({ config, logger }) {
  const router = Router()
  router.post('/v1/todo', todoAction)
  return router
}

klappService.bootstrapApp({ handlers: createHandlers({ config, logger }), healthChecks: [] })
klappService.run()
