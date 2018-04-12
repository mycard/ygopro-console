database = require './database'
moment = require 'moment'
mycardPool = database.mycardPool
ygoproPool = database.ygoproPool

PAGE_LIMIT = 100
QUERY_MYCARD_SQL = 'select * from users where name like $1::text or username like $1::text limit 200'
QUERY_MYCARD_IP_SQL = 'select * from users where registration_ip_address like $1::text or ip_address like $1::text limit 200'
QUERY_MYCARD_ID_SQL = 'select * from users where id in '
QUERY_YGOPRO_SQL = 'select * from user_info where username = $1::text'
SET_YGOPRO_DP_SQL = 'update user_info set pt = $2 where username = $1::text'
GET_MESSAGE_SQL = "select * from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level >= $2 order by time desc limit #{PAGE_LIMIT} offset $3"
GET_MESSAGE_COUNT_SQL = 'select count(*) from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level >= $2'

queryUser = (user, callback) ->
  mycardPool.query QUERY_MYCARD_SQL, ["%#{user}%"], (err, result) ->
    if err
      console.log err
      callback.call this, []
      return
    else if result.rows.length == 0
      callback.call this, []
      return
    else if result.rows.length > 1
      names = result.rows.map (data) -> data.username
      index = names.indexOf user
      if index < 0
        callback.call this, names
        return
      else
        result.rows[0] = result.rows[index]
    ygoproPool.query QUERY_YGOPRO_SQL, [result.rows[0].username], (err2, result2) ->
      if err2
        console.log err2
      callback.call this, Object.assign result.rows[0], result2.rows[0]

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

module.exports.queryUser = queryUser
module.exports.queryUserViaIp = queryUserViaIp
module.exports.queryUserViaIds = queryUserViaIds
module.exports.setUserDp = setUserDp

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