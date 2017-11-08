/**
 * Standalone consumer app
 *
 * This app consumes the statement_available kafka topic and persists it
 * to the database as a Statement.
 *
 */
const { createConsumer, createCheckpoint } = require('phobos')
const { createStatement } = require('./statement')

// Instantiate a database checkPoint handler with config from phobos.json
const checkPoint = createCheckpoint()

const app = createConsumer({ topic: 'statement_available', checkPoint: checkPoint })

/**
 * If the callback is successful, the message will be persisted in checkPoint as
 * an event, if it throws it will be persisted in checkPoint as a failure
 */
app.on('messageReceived', message => {
  const statement = createStatement(message.data())
})

app.run()
