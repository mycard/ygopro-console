RECORD_QUERY_SQL = "select * from unknown_decks where time >= $1 and time <= $2 and user like $3::text and "

getRecords = (start_time, end_time, user, source) ->