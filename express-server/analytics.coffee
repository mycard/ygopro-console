database = require './database'
mycardPool = database.mycardPool
ygoproPool = database.ygoproPool

custom_commands = require './analytics.json'
fs = require 'fs'

PAGE_LIMIT = 100
HISTORY_QUERY_SQL = "select * from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text and start_time >= $3 and start_time <= $4 order by start_time desc limit #{PAGE_LIMIT} offset $5"
HISTORY_COUNT_SQL = "select count(*) from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text and start_time >= $3 and start_time <= $4 "
DECK_QUERY_SQL = "select name, source, sum(count) sc from deck_day where (name like $1::text and source like $2::text) and time >= $3 and time <= $4 group by name, source order by sc desc, source desc limit #{PAGE_LIMIT} offset $5"
DECK_COUNT_SQL = "select count(*) from (select sum(count) sc from deck_day where (name like $1::text and source like $2::text) and time >= $3 and time <= $4 group by name, source) as counts"
DAILY_COUNT =
  'SELECT day, sum(' +
  '      CASE' +
  '            WHEN sum_time < \'1 hour\' THEN 0' +
  '            WHEN sum_time < \'30 minute\' THEN 0.5' +
  '            ELSE 1' +
  '      END) AS day_active_users ' +
  'FROM' +
  '      (SELECT username, sum(time_length) AS sum_time, day FROM' +
  '            (SELECT usernamea AS username, end_time - battle_history.start_time AS time_length, date_trunc(\'day\', start_time) as day' +
  '                  FROM battle_history' +
  '                  WHERE type like $1::text and start_time >= $2 and start_time <= $3' +
  '                  UNION SELECT usernameb AS username, end_time - battle_history.start_time AS time_length, date_trunc(\'day\', start_time) as day' +
  '                        FROM battle_history' +
  '                        WHERE type like $1::text and start_time >= $2 and start_time <= $3) as B' +
  '      GROUP BY username, day) as user_time ' +
  'GROUP BY day ORDER BY day DESC;'

runCommands = (start_time, end_time) ->
  answer = []
  promises = []
  query_time_args = [start_time.format('YYYY-MM-DD HH:mm:ss'), end_time.format('YYYY-MM-DD HH:mm:ss')]
  for command in custom_commands
    `let name = command.name`
    `let tag = command.tag`
    target_pool = if command.target == 'mycard' then mycardPool else ygoproPool
    query_parameters = if command.time then query_time_args else []
    promises.push target_pool.query(command.query, query_parameters).then (result) ->
      answer.push { name: name, result: result.rows, tag: tag }
  Promise.all(promises).then (result) ->
    ordered_answers = []
    ordered_answers.push answer[order - 1] for order in result
    ordered_answers


setCommands = (commands) ->
  custom_commands = commands
  fs.writeFile './express-server/analytics.json', JSON.stringify(commands, null, 2), ->

Object.assign module.exports, database.defineStandatdQueryFunctions 'queryHistory', database.ygoproPool, HISTORY_QUERY_SQL, HISTORY_COUNT_SQL, PAGE_LIMIT
Object.assign module.exports, database.defineStandatdQueryFunctions 'queryDeck', database.ygoproPool, DECK_QUERY_SQL, DECK_COUNT_SQL, PAGE_LIMIT

dailyCount = (type, start_time, end_time) ->
  new Promise (resolve, reject) ->
    type = '%' if !type or type == 'all'
    ygoproPool.query DAILY_COUNT, [type, start_time, end_time], (err, result) -> database.standardPromiseCallback resolve, reject, err, result

module.exports.runCommands = runCommands
module.exports.setCommands = setCommands
module.exports.dailyCount = dailyCount