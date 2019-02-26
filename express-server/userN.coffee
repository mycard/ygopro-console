database = require './database'
router = require './router'
moment = require 'moment'
config = require './config.json'
mycardPool = database.mycardPool
ygoproPool = database.ygoproPool

route_user = (route) ->
    route.count_get '/search',                user_search_name,     { user: "s" }
    route.count_get '/search/name',           user_search_name,     { user: "s" }
    route.count_get '/search/ip',             user_search_ip,       { ip: "o" }
    route.quick_get '/detail/:user/mc',       user_detail_mcuser,   { user: "o" }
    route.quick_get '/detail/:user/usedname', user_detail_usedname, { user: "o" }
    route.quick_get '/detail/:user/userinfo', user_detail_userinfo, { user: "o" }
    route.count_get '/detail/:user/ban',      user_banned_history,  { user: "o" }
    route.count_get '/detail/:user/score',    user_score_history,   { user: "o" }
    route.quick_post '/:user/pt',             user_set_pt,          { user: "o", value: "f" }
    route.quick_post '/:user/exp',            user_set_exp,         { user: "o", value: "f" }
    route.quick_post '/:user/ban',            user_set_ban,         { user: "o", value: "i" }

SQL_USER_SEARCH_NAME = "select * from users where name like $1::text or username like $1::text order by id limit #{config.limitCount} offset $2::integer"
SQL_USER_SEARCH_NAME_COUNT = 'select count(*) from users where name like $1::text or username like $1::text'
user_search_name = (username, page = 0) -> 
    await database.standardCountedPGQuery mycardPool, SQL_USER_SEARCH_NAME, SQL_USER_SEARCH_NAME_COUNT, [username, page]

SQL_USER_SEARCH_IP = "select * from users where ip_address = $1::text or registration_ip_address = $1::text order by id limit #{config.limitCount} offset $2::integer"
SQL_USER_SEARCH_IP_COUNT = 'select count(*) from users where ip_address = $1::text or registration_ip_address = $1::text'
user_search_ip = (ip, page = 0) ->
    await database.standardCountedPGQuery mycardPool, SQL_USER_SEARCH_IP, SQL_USER_SEARCH_IP_COUNT, [ip, page]

SQL_USER_DETAIL_MCUSER = "select * from users where username = $1::text"
user_detail_mcuser = (username) ->
    await database.standardPGQuery mycardPool, SQL_USER_DETAIL_MCUSER, [username]

SQL_USER_USEDNAME = 'select * from username_change_history where change_time < $1 and new_username = $2 limit 1'
user_detail_usedname = (username) ->
    names = []
    name = username
    time = moment().format('YYYY-MM-DD HH:mm:ss')
    while true
        query = await mycardPool.query SQL_USER_USEDNAME, [time, name]
        if query.rows.length == 0
            return names
        else
            row = query.rows[0]
            names.push row
            name = row.old_username
            time = row.change_time
    return names

SQL_USER_DETAIL_USERINFO = "select * from user_info where username = $1::text"
user_detail_userinfo = (username) ->
    await database.standardPGQuery ygoproPool, SQL_USER_DETAIL_USERINFO, [username]

SQL_USER_BANNED_HISTORY = "select * from user_ban_history where username = $1::text limit 5 offset $2::integer"
SQL_USER_BANNED_HISTORY_COUNT = "select count(*) from user_ban_history where username = $1::text"
user_banned_history = (username, page = 0) ->
    await database.standardCountedPGQuery ygoproPool, SQL_USER_BANNED_HISTORY, SQL_USER_BANNED_HISTORY_COUNT, [username, page], 5

SQL_USER_SCORE_HISTORY = "select * from user_historical_record where username = $1::text order by season desc limit 5 offset $2::integer"
SQL_USER_SCORE_HISTORY_COUNT = "select count(*) from user_historical_record where username = $1::text"
user_score_history = (username, page = 0) ->
    await database.standardCountedPGQuery ygoproPool, SQL_USER_SCORE_HISTORY, SQL_USER_SCORE_HISTORY_COUNT, [username, page], 5

SQL_USER_SET_PT = "update user_info set pt = $1::double precision where username = $2::text"
user_set_pt = (username, value) ->
    await database.standardPGQuery ygoproPool, SQL_USER_SET_PT, [value, username]

SQL_USER_SET_EXP = "update user_info set exp = $1::double precision where username = $2::text"
user_set_exp = (username, value) ->
    await database.standardPGQuery ygoproPool, SQL_USER_SET_EXP, [value, username]

SQL_USER_BAN = "insert into user_ban_history values($1::string, $2::timestamp, $3::timestamp)"
user_set_ban = (username, hours) ->
    _from = moment()
    to = moment().add(hours, 'hour')
    await database.standardCountedPGQuery ygoproPool, SQL_USER_BAN, [username, _from, to]

route_message = (route) ->
    route.count_get '/message', message_query, { keyword: "s", level: "i" }

SQL_MESSAGE_QUERY = "select * from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level >= $2::integer order by time desc limit #{config.limitCount} offset $3"
SQL_MESSAGE_QUERY_COUNT = 'select count(*) from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level >= $2::integer'
message_query = (content, level, page = 0) ->
    await database.standardCountedPGQuery ygoproPool, SQL_MESSAGE_QUERY, SQL_MESSAGE_QUERY_COUNT, [content, level, page]

route_vote = (route) ->
    route.quick_get  '/vote',     vote,         { }
    route.quick_get  '/vote/:id', vote_tickets, { id: 'i' }
    route.quick_post '/vote/:id', vote_set,     { id: 'i', body: 'j' }

SQL_VOTE = 'select * from votes'
vote = () ->
    await database.standardPGQuery ygoproPool, SQL_VOTE, []

SQL_VOTE_TICKETS = 'select * from vote_result where vote_id = $1::text'
vote_tickets = (id) ->
    await database.standardPGQuery ygoproPool, SQL_VOTE_TICKETS, [id]

vote_set = (id) ->


route = router()
route_user route
route_message route
route_vote route
module.exports = route