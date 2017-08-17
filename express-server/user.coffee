database = require './database'
mycardPool = database.mycardPool
ygoproPool = database.ygoproPool

PAGE_LIMIT = 100
QUERY_MYCARD_SQL = 'select * from users where name like $1::text or username like $1::text limit 200'
QUERY_MYCARD_IP_SQL = 'select * from users where registration_ip_address like $1::text or ip_address like $1::text limit 200'
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

setUserDp = (user, dp, callback) ->
  ygoproPool.query SET_YGOPRO_DP_SQL, [user, dp], (err, result) ->
    if err
      console.log err
      callback.call this, null
    else
      callback.call this, result

Object.assign module.exports, database.defineStandatdQueryFunctions 'queryMessage', database.ygoproPool, GET_MESSAGE_SQL, GET_MESSAGE_COUNT_SQL, PAGE_LIMIT

module.exports.queryUser = queryUser
module.exports.queryUserViaIp = queryUserViaIp
module.exports.setUserDp = setUserDp