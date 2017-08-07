moment = require 'moment'

format_time = (time) ->
  return null unless time and time > 0
  moment(time)

time_router = (req, res, next) ->
  start_time = parseInt req.query.start_time
  end_time = parseInt req.query.end_time
  req.start_time = format_time(start_time) || moment('1970-01-01 00:00:00')
  req.end_time = format_time(end_time) || moment()
  next()

module.exports.timeRouter = time_router