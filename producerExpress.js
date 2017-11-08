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
