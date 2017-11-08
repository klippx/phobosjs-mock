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
