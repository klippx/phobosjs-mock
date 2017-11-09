/**
 * Standalone consumer app
 *
 * This app consumes the statement_available kafka topic and persists it
 * to the database as a Statement.
 *
 * The idea of a "messageWrapper" is to provide a way to wrap the consumption of a message
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
 * checkPoint implements a closure to wrap the consumption of a message which
 * eventually invokes onMessage
 *
 */
const checkPoint = createDBCheckpoint()

/**
 * Option 1
 */
const app = createConsumer({ topic: 'statement_available', messageWrapper: checkPoint })

/**
 * Option 2
 */
const app = createConsumer({ topic: 'statement_available' })
app.registerMessageWrapper(checkPoint)

/**
 * If the callback is successful, the message will be persisted in db as
 * an event, if it throws it will be persisted in db as a failure (after retrying a few times)
 */
app.onMessage(async (message, metadata) => {
  const statement = createStatement(message.data())
})

/**
 * Considering that a messageWrapper will in some way handle errors...
 * Need to think about what happens with overlaps between checkPoint and regular phobos onError callbacks?
 * - Maybe don't need to handle this here, since we might be at risk of messing with checkPoint...?
 * - Or this is a "safe" callback that will always be invoked regardless of checkPoint?
 */
app.onError(async error => {
  console.log('Error happened, but the checkPoint probably dealt with it', error)
})

app.run()
