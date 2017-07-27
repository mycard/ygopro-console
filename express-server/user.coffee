{ mycardPool, ygoproPool } = require './database'

QUERY_MYCARD_SQL = 'select * from users where name like $1::text or username like $1::text'
QUERY_YGOPRO_SQL = 'select * from user_info where username = $1::text'
SET_YGOPRO_DP_SQL = 'update user_info set pt = $2 where username = $1::text'


queryUser = (user, callback) ->
  mycardPool.query QUERY_MYCARD_SQL, ["%#{user}%"], (err, result) ->
    if err
      console.log err
      callback.call this, null
      return
    else if result.rows.length == 0
      callback.call this, {}
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


setUserDp = (user, dp, callback) ->
  ygoproPool.query SET_YGOPRO_DP_SQL, [user, dp], (err, result) ->
    if err
      console.log err
      callback.call this, null
    else
      callback.call this, result


module.exports.queryUser = queryUser
module.exports.setUserDp = setUserDp