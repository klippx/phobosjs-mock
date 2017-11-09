/**
 * Standalone consumer app
 *
 * This app consumes the statement_available kafka topic and persists it
 * to the database as a Statement.
 *
 * The idea of a "checkpoint" is to provide a way to wrap the consumption of a message
 * around a try/catch and allowing for handling errors, retries, and even success results
 * in a configurable manner.
 *
 */
const { createConsumer } = require('phobos')
const { createDBCheckpoint } = require('phobos-db-checkpoint')
const { createStatement } = require('./statement')

/**
 * Instantiate a database checkPoint handler with config from .phobosdbcheckpointjs
 *
 * checkPoint implements an #messageWrapper closure to wrap the consumption of a message
 * which eventually invokes onMessage
 *
 */
const checkPoint = createDBCheckpoint()

const app = createConsumer({ topic: 'statement_available' })
app.registerCheckpoint(checkPoint)

/**
 * If the callback is successful, the message will be persisted in checkPoint as
 * an event, if it throws it will be persisted in checkPoint as a failure (after retrying a few times)
 */
app.onMessage(async (message, metadata) => {
  const statement = createStatement(message.data())
})

/**
 * Considering that checkPoint will in some way handle errors...
 * Need to think about what happens with overlaps between checkPoint and regular phobos onError callbacks?
 * - Maybe don't need to handle this here, since we might be at risk of messing with checkPoint...?
 * - Or this is a "safe" callback that will always be invoked regardless of checkPoint?
 */
app.onError(async error => {
  console.log('Error happened, deal with it', error)
})

app.run()
