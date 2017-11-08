# phobosjs-mock

Some simple ideas in code how we could be using phobos-js in practice.

The core ideas are
- No multiprocessing, keep it simple. 
  - No need to farm out resources on each node, assume micro instances
  - This alone should greatly reduce complexity of the Phobos code and make it easier to understand/contribute
  - Instead, scale horizontally
  - One service instance <=> one consumer <=> one configuration
- Avoid metaprogramming and implicit contracts between users' services and phobos-js
  - The user is in control
  - The code written in services should be simple and readable, even if you don't know kafka (or even phobos!) you should still be able to understand
- Move as much config as possible to `phobos.json`
- Require as little config as possible inside the users' services, if any.
- Think just as much about helping testing the users' services as writing them in the first place (similar to mappersmith)
- Consider possibility of plugin support such as 
  - phobos-db-checkpoint
  - phobos-checkpoint-ui
  - phobos-prometheus (provide collectors and exporters for internal consumer/producer metrics)
  - phobos-grafana (provide some rudimentary graphing of the data exported above)
