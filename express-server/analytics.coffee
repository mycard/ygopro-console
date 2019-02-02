database = require './database'
mycardPool = database.mycardPool
ygoproPool = database.ygoproPool

custom_commands = require './analytics.json'
fs = require 'fs'
data = require 'ygojs-data'

PAGE_LIMIT = 100
HISTORY_QUERY_SQL = "select * from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text and start_time >= $3 and start_time <= $4 order by start_time desc limit #{PAGE_LIMIT} offset $5"
HISTORY_COUNT_SQL = "select count(*) from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text and start_time >= $3 and start_time <= $4 "
DECK_QUERY_SQL = "select name, source, sum(count) sc from deck_day where (name like $1::text and source like $2::text) and time >= $3 and time <= $4 group by name, source order by sc desc, source desc limit #{PAGE_LIMIT} offset $5"
DECK_COUNT_SQL = "select count(*) from (select sum(count) sc from deck_day where (name like $1::text and source like $2::text) and time >= $3 and time <= $4 group by name, source) as counts"
TAG_QUERY_SQL = "select name, source, sum(count) sc from tag_day where (name like $1::text and source like $2::text) and time >= $3 and time <= $4 group by name, source order by sc desc, source desc limit #{PAGE_LIMIT} offset $5"
TAG_COUNT_SQL = "select count(*) from (select sum(count) sc from tag_day where (name like $1::text and source like $2::text) and time >= $3 and time <= $4 group by name, source) as counts"
SINGLE_QUERY_SQL = "select id, source, sum(frequency) sc, sum(numbers) numbers, sum(putone) putone, sum(puttwo) puttwo, sum(putthree) putthree, sum(putoverthree) putoverthree from single_day where (id in $0 and source like $1::text) and time >= $2 and time <= $3 group by id, source order by sc desc, source desc limit #{PAGE_LIMIT} offset $4"
SINGLE_COUNT_SQL = "select count(*) from (select sum(frequency) sc from single_day where (id in $0 and source like $1::text) and time >= $2 and time <= $3 group by id, source) as counts"
PURE_COUNT_SQL = "select sum(count) count from counter where timeperiod = 1 and source like $1::text and time >= $2 and time <= $3"
MATCHUP_QUERY_SQL = "select * from matchup where source = $1::text and decka = $2::text and deckb = $3::text and period = $4::text"
MATCHUP_QUERY_SINGLE_LEFT = "select count(*) from matchup where source = $1::text and decka = $2::text and period = $3::text and win + lose > 50"
MATCHUP_QUERY_SINGLE_RIGHT = "select count(*) from matchup where source = $1::text and deckb = $2::text and period = $3::text and win + lose > 50"

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


MATCHUP_QUERY_SINGLE =
"select *, (cast (win as Float) / (T.win + T.draw + T.lose)) win_rate from (
  select source, decka, deckb, period, draw, lose, win from matchup where decka = $2::text and source = $1::text and period = $3::text
  union select source, deckb, decka, period, draw, win, lose from matchup where deckb = $2::text and source = $1::text and period = $3::text
                ) as T where T.win + T.lose > 50
order by win_rate desc limit #{PAGE_LIMIT} offset $4"

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

Object.assign module.exports, database.defineStandardQueryFunctions 'queryHistory', database.ygoproPool, HISTORY_QUERY_SQL, HISTORY_COUNT_SQL, PAGE_LIMIT
Object.assign module.exports, database.defineStandardQueryFunctions 'queryDeck', database.ygoproPool, DECK_QUERY_SQL, DECK_COUNT_SQL, PAGE_LIMIT
Object.assign module.exports, database.defineStandardQueryFunctions 'queryTag', database.ygoproPool, TAG_QUERY_SQL, TAG_COUNT_SQL, PAGE_LIMIT

queryId = (name) ->
  return "(ANY)" if name == ""
  return null unless name
  id = parseInt name
  unless isNaN id
    ids = [id]
  else
    environment = new data.Environment 'zh-CN'
    return null unless environment
    ids = environment.searchCardByName name
    return null if ids.length == 0
    ids = ids[0..49] if ids.length > 50
  return "(#{ids.join(', ')})"

querySingle = (name, type, start_time, end_time, page) ->
  name = queryId name
  return [] unless name
  page = (page - 1) * PAGE_LIMIT
  type = "%#{type}%"
  start_time = start_time.format('YYYY-MM-DD HH:mm:ss')
  end_time = end_time.format('YYYY-MM-DD HH:mm:ss')
  query = if name == "(ANY)" then SINGLE_QUERY_SQL.replace("id in $0 and", "") else SINGLE_QUERY_SQL.replace('$0', name)
  environment = new data.Environment 'zh-CN'
  new Promise (resolve, reject) =>
    ygoproPool.query query, [type, start_time, end_time, page], (err, result) ->
      database.standardPromiseCallback(resolve, reject, err, result)
  .then (datas) ->
    datas.map (item) ->
      card = environment.getCardById item.id
      item.name = card.name if card
      item

querySingleCount = (name, type, start_time, end_time, page) ->
  name = queryId name
  return [] unless name
  page = (page - 1) * PAGE_LIMIT
  type = "%#{type}%"
  start_time = start_time.format('YYYY-MM-DD HH:mm:ss')
  end_time = end_time.format('YYYY-MM-DD HH:mm:ss')
  query = if name == "(ANY)" then SINGLE_COUNT_SQL.replace("id in $0 and", "") else SINGLE_QUERY_SQL.replace('$0', name)
  new Promise (resolve, reject) =>
    ygoproPool.query query, [type, start_time, end_time], (err, result) =>
      if err
        resolve 0
      else
        resolve Math.ceil result.rows[0].count / PAGE_LIMIT

queryPureCount = (source, start_time, end_time) ->
  source = "%#{source}%"
  start_time = start_time.format('YYYY-MM-DD HH:mm:ss')
  end_time = end_time.format('YYYY-MM-DD HH:mm:ss')
  new Promise (resolve, reject) ->
    ygoproPool.query PURE_COUNT_SQL, [source, start_time, end_time], (err, result) ->
      if err
        console.log err
        resolve 0
      else
        resolve result.rows[0].count || 0

dailyCount = (type, start_time, end_time) ->
  new Promise (resolve, reject) ->
    type = '%' if !type or type == 'all'
    ygoproPool.query DAILY_COUNT, [type, start_time, end_time], (err, result) -> database.standardPromiseCallback resolve, reject, err, result

queryMatchup = (source, decka, deckb, period) ->
  [decka, deckb] = [deckb, decka] if decka > deckb
  ans = await ygoproPool.query MATCHUP_QUERY_SQL, [source, decka, deckb, period]
  ans.rows

queryMatchupSingle = (source, decka, period, page) ->
  ans = await ygoproPool.query MATCHUP_QUERY_SINGLE, [source, decka, period, page * PAGE_LIMIT]
  ans.rows

queryMatchupSingleCount = (source, decka, period) ->
  left  = await ygoproPool.query MATCHUP_QUERY_SINGLE_LEFT,  [source, decka, period]
  right = await ygoproPool.query MATCHUP_QUERY_SINGLE_RIGHT, [source, decka, period]
  Math.ceil (parseInt(left.rows[0].count) + parseInt(right.rows[0].count)) / PAGE_LIMIT

module.exports.runCommands = runCommands
module.exports.setCommands = setCommands
module.exports.dailyCount = dailyCount
module.exports.querySingle = querySingle
module.exports.querySingleCount = querySingleCount
module.exports.queryPureCount = queryPureCount
module.exports.queryMatchup = queryMatchup
module.exports.queryMatchupSingle = queryMatchupSingle
module.exports.queryMatchupSingleCount = queryMatchupSingleCount