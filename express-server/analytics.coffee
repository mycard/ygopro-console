{ mycardPool, ygoproPool } = require './database'
custom_commands = require './analytics.json'

PAGE_LIMIT = 100
HISTORY_QUERY_SQL = "select * from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text order by start_time desc limit #{PAGE_LIMIT} offset $3"
HISTORY_COUNT_SQL = "select count(*) from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text"

runCommands = (callback) ->
  answer = []
  promises = []
  for command in custom_commands
    `let name = command.name`
    target_pool = if command.target == 'mycard' then mycardPool else ygoproPool
    promises.push target_pool.query(command.query).then (result) ->
      answer.push { name: name, result: result.rows }
  Promise.all(promises).then ->
    callback.call this, answer

queryHistory = (name, type, start, callback) ->
  type = "%" if type == 'all' or !type
  ygoproPool.query HISTORY_QUERY_SQL, ["%#{name}%", type, (start - 1) * PAGE_LIMIT], (err, result) ->
    if err
      console.log err
      callback.call this, []
    else
      callback.call this, result.rows

queryHistoryCount = (name, type, callback) ->
  type = "%" if type == 'all' or !type
  ygoproPool.query HISTORY_COUNT_SQL, ["%#{name}%", type], (err, result) ->
    if err
      console.log err
      callback.call this, 0
    else
      callback.call this, Math.ceil(result.rows[0].count / PAGE_LIMIT)

module.exports.queryHistory = queryHistory
module.exports.queryHistoryCount = queryHistoryCount
module.exports.runCommands = runCommands
