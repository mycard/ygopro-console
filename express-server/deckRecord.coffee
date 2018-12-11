database = require './database'
moment = require 'moment'

RECORD_QUERY_COUNT_SQL = "select count(*) from unknown_decks where time >= $1::timestamp and time <= $2::timestamp and user like $3::text and source like $4::text"
RECORD_QUERY_ID_SQL = "select id from unknown_decks where time >= $1 and time <= $2 and user like $3::text and source like $4::text and id > $5 order by id asc limit 1"
RECORD_GET_SQL = "select * from unknown_decks where id = $1"
RECORD_REMOVE_SQL = "delete from unknown_decks where id = $1"
RECORD_CLEAR_SQL = "delete from unknown_decks where time >= $1 and time <= $2 and user like $3::text and source like $4::text"

getRecord = (sql, start_time, end_time, user, source) ->
  user ||= ""
  source ||= ""
  user_query = "%#{user}%"
  source = "%#{source}%"
  start_time = moment(start_time, "x").format "YYYY-MM-DD HH:mm:ss"
  end_time = moment(end_time, "x").format "YYYY-MM-DD HH:mm:ss"
  query = await database.ygoproPool.query sql, [start_time, end_time, user_query, source]
  query.rows[0]

getRecordCount = (start_time, end_time, user, source) ->
  result = await getRecord(RECORD_QUERY_COUNT_SQL, start_time, end_time, user, source)
  result.count
getRecordId = (start_time, end_time, user, source, id) ->
  id = id || '0'
  id = parseInt id
  start_time = moment(start_time, "x").format "YYYY-MM-DD HH:mm:ss"
  end_time = moment(end_time, "x").format "YYYY-MM-DD HH:mm:ss"
  query = await database.ygoproPool.query RECORD_QUERY_ID_SQL, [start_time, end_time, "%#{user}%", "%#{source}%", id]
  query.rows[0]
clearRecord = (start_time, end_time, user, source) ->
  await getRecord(RECORD_CLEAR_SQL, start_time, end_time, user, source)
getRecordDeck = (id) ->
  query = await database.ygoproPool.query RECORD_GET_SQL, [parseInt id]
  query.rows[0]
removeRecord = (id) ->
  await database.ygoproPool.query RECORD_REMOVE_SQL, [id]

router = (app) ->
  app.get '/profile/record/count', (req, res) -> res.json await getRecordCount req.query.start_time, req.query.end_time, req.query.user, req.query.source
  app.get '/profile/record/id', (req, res) -> res.json await getRecordId req.query.start_time, req.query.end_time, req.query.user, req.query.source, req.query.id
  app.get '/profile/record/deck', (req, res) -> res.json await getRecordDeck req.query.id
  app.delete 'profile/record/remove', (req, res) -> res.json await removeRecord req.query.id
  app.delete '/profile/record/clear', (req, res) -> res.json clearRecord req.query.start_time, req.query.end_time, req.query.user, req.query.source

module.exports.getRecordCount = getRecordCount
module.exports.getRecordId =  getRecordId
module.exports.getRecordDeck = getRecordDeck
module.exports.removeRecord = removeRecord
module.exports.clearRecord = clearRecord
module.exports.router = router
