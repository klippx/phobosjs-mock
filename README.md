# phobosjs-mock

Some simple ideas in code how we could be using phobos in practice.

The core ideas are
- No multiprocessing, keep it simple.
  - No need to farm out resources on each node, assume micro instances
  - This alone should greatly reduce complexity of the Phobos code and make it easier to understand/contribute
  - Instead, scale horizontally
  - One service instance <=> one consumer <=> one configuration
- Avoid meta programming and implicit contracts between users' services and phobos
  - The user is in control
  - The code written in services should be simple and readable, even if you don't know kafka (or even phobos!) you should still be able to understand
- Move as much config as possible to `.phobosjs`
- Require as little config as possible inside the users' services, if any.
- Consider possibility of support such as
  - Providing test tools for writing the consumer applications
  - [Possibility to decode avro encoded kafka messages](standaloneConsumer-serializer.js)
  - [Possibility of wrapping the message consumption and dealing with results (errors/success)](standaloneConsumer-messageWrapper.js)
  - phobos-checkpoint-ui
  - phobos-sensor
    - => phobos-prometheus (provide collectors and exporters for internal consumer/producer metrics)
    - => phobos-grafana (provide some rudimentary graphing of the data exported above)
