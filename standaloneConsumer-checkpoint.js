/**
 * Standalone consumer app
 *
 * This app consumes the statement_available kafka topic and persists it
 * to the database as a Statement.
 *
 */
const { createConsumer } = require('phobos')
const { createCheckpoint } = require('phobos-db-checkpoint')
const { createStatement } = require('./statement')

// Instantiate a database checkPoint handler with config from .phobosdbcheckpointjs
const checkPoint = createCheckpoint()

const app = createConsumer({ topic: 'statement_available', checkPoint: checkPoint })

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
