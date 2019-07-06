database = require './database'
moment = require 'moment'
mycardPool = database.mycardPool
ygoproPool = database.ygoproPool

PAGE_LIMIT = 100
QUERY_MYCARD_SQL = 'select * from users where name like $1::text or username like $1::text limit 200'
QUERY_MYCARD_LIMITED_SQL = 'select * from users where username = $1::text'
QUERY_MYCARD_IP_SQL = 'select * from users where registration_ip_address like $1::text or ip_address like $1::text limit 200'
QUERY_MYCARD_ID_SQL = 'select * from users where id in '
QUERY_YGOPRO_SQL = 'select * from user_info where username = $1::text'
SET_YGOPRO_DP_SQL = 'update user_info set pt = $2 where username = $1::text'
GET_MESSAGE_SQL = "select * from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level >= $2 order by time desc limit #{PAGE_LIMIT} offset $3"
GET_MESSAGE_COUNT_SQL = 'select count(*) from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level >= $2'
GET_RECENT_MATCH_COUNT = 'select count(*) from battle_history where end_time > (now() - interval \'30 day\') and (usernamea = $1::text or usernameb = $1::text);'
GET_RECENT_DROP_MATCH_COUNT = 'select count(*) from battle_history where end_time > (now() - interval \'30 day\') and ((usernamea = $1::text and userscorea <= -7) or (usernameb = $1::text and userscoreb <= -7))'
QUERY_RECENT_USERNAME = 'select * from username_change_history where change_time < $1 and new_username = $2 limit 1'

queryUser = (user) ->
  if user.startsWith('"') and user.endsWith('"')
    mycard_result = await mycardPool.query QUERY_MYCARD_LIMITED_SQL, [user.substring 1, user.length - 1]
  else
    mycard_result = await mycardPool.query QUERY_MYCARD_SQL, [database.formatText(user)]
  return [] if mycard_result.rows.length == 0
  if mycard_result.rows.length > 1
    names = mycard_result.rows.map (data) -> data.username
    index = names.indexOf user
    return names unless index >= 0
    userdata = mycard_result.rows[index]
  else
    userdata = mycard_result.rows[0]
  ygopro_result = await Promise.all [
    ygoproPool.query QUERY_YGOPRO_SQL, [userdata.username]
    ygoproPool.query GET_RECENT_MATCH_COUNT, [userdata.username]
    ygoproPool.query GET_RECENT_DROP_MATCH_COUNT, [userdata.username]
  ]
  userdata = Object.assign userdata, ygopro_result[0].rows[0]
  userdata.recent_match = parseInt ygopro_result[1].rows[0].count
  userdata.recent_drop = parseInt ygopro_result[2].rows[0].count
  userdata

queryUserViaIp = (ip, callback) ->
  ip = ip.replace "*", "%"
  mycardPool.query QUERY_MYCARD_IP_SQL, ["%#{ip}%"], (err, result) ->
    if err
      console.log err
      callback.call this, []
    else if result.rows.length == 0
      callback.call this, []
    else
      callback.call this, result.rows.map (user) => user.username

queryUserViaIds = (ids) ->
  query = QUERY_MYCARD_ID_SQL + "(" + ids.join(",") + ")"
  await mycardPool.query query.toString(), []

setUserDp = (user, dp, callback) ->
  ygoproPool.query SET_YGOPRO_DP_SQL, [user, dp], (err, result) ->
    if err
      console.log err
      callback.call this, null
    else
      callback.call this, result

Object.assign module.exports, database.defineStandardQueryFunctions 'queryMessage', database.ygoproPool, GET_MESSAGE_SQL, GET_MESSAGE_COUNT_SQL, PAGE_LIMIT

searchUserUsedName = (username) ->
  names = []
  name = username
  time = moment().format('YYYY-MM-DD HH:mm:ss')
  for i in [1..10]
    query = await mycardPool.query QUERY_RECENT_USERNAME, [time, name]
    if query.rows.length == 0
      return names
    else
      row = query.rows[0]
      names.push row
      name = row.old_username
      time = row.change_time
  return names

module.exports.queryUser = queryUser
module.exports.queryUserViaIp = queryUserViaIp
module.exports.queryUserViaIds = queryUserViaIds
module.exports.setUserDp = setUserDp
module.exports.searchUserUsedName = searchUserUsedName

# Vote part
GET_VOTES = "select * from votes"
GET_TARGET_VOTE = "select * from votes where id = $1"
GET_VOTE_TICKETS = "select * from vote_result where vote_id = $1::text"
INSERT_VOTE = "insert into votes values(default, $1::text, $2::text, $3, $4, $5::timestamp, $6::boolean, $7::boolean, $8::integer)"
SET_VOTE = "update votes set title = $2::text, options = $3::text, start_time = $4::timestamp, end_time = $5::timestamp, status = $6::boolean, multiple = $7::boolean, max = $8::integer where id = $1::integer"

getVotes = ->
  result = await ygoproPool.query GET_VOTES
  votes = result.rows
  votes.forEach (vote) -> vote.options = JSON.parse vote.options
  votes

getVoteTickets = (id) ->
  # Search vote via id.
  vote = (await ygoproPool.query GET_TARGET_VOTE, [id]).rows[0]
  vote.options = JSON.parse vote.options
  result = await ygoproPool.query GET_VOTE_TICKETS, [vote.id]
  tickets = result.rows
  # Add option information.
  option_map = new Map
  vote.options.forEach (option) -> option_map.set option.key.toString(), option
  tickets.forEach (ticket) -> ticket.option = option_map.get ticket.option_id.toString()
  tickets

saveVote = (vote) ->
  vote.options.forEach (option, index) -> option.key = moment().format('x') - index unless option.key
  await ygoproPool.query SET_VOTE, [vote.id, vote.title, JSON.stringify(vote.options), vote.start_time, vote.end_time, vote.status, vote.multiple, vote.max]

insertVote = (vote) ->
  vote.options.forEach (option, index) -> option.key = moment().format('x') - index unless option.key
  await ygoproPool.query INSERT_VOTE, [vote.title, JSON.stringify(vote.options), moment(vote.create_time), moment(vote.start_time), moment(vote.end_time), vote.status, vote.multiple, vote.max]

module.exports.getVotes = getVotes
module.exports.getVoteTickets = getVoteTickets
module.exports.saveVote = saveVote
module.exports.insertVote = insertVote

# Ban History
GET_BANNED_ALL = "select * from user_ban_history order by \"from\" desc limit #{PAGE_LIMIT} offset $1"
GET_BANNED_PAGES = "select count(*) from user_ban_history"
GET_BANNED_HISTORY = "select * from user_ban_history where username = $1::text"
BAN_USER_SQL = "insert into user_ban_history values($1::text, $2::text, now() + '__$0__ day', now(), $3::integer, $4::text, $5::text)"
QUERY_USER_ID = "select id from users where username = $1"

Object.assign module.exports, database.defineStandardQueryFunctions 'queryBan', database.ygoproPool, GET_BANNED_ALL, GET_BANNED_PAGES, PAGE_LIMIT

queryUserBanHistory = (name) ->
  result = await ygoproPool.query GET_BANNED_HISTORY, [name]
  result.rows

banUser = (name, to, level, reason, operator) ->
  level = level || "silence"
  reason = reason || "no reason"
  operator = operator || "admin"
  sql = BAN_USER_SQL.replace "__$0__", parseFloat to
  id_query = await mycardPool.query QUERY_USER_ID, [name]
  if id_query.rows[0]
    id = id_query.rows[0].id
  else
    id = 0
  console.log sql
  await ygoproPool.query sql, [name, level, id, reason, operator]

module.exports.queryUserBanHistory = queryUserBanHistory
module.exports.banUser = banUser