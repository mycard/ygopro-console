express = require 'express'
user = require './user'
analytics = require './analytics'
authorizeRouter = require('./author').authorizeRouter
path = require 'path'

server = express()

# React Static File
server.use express.static('react-pages/build')

server.use '/analytics/*', authorizeRouter

server.use '/user/*', authorizeRouter

server.get '/user/:target_username', (req, res) ->
  target_username = req.params.target_username
  user.queryUser target_username, (result) ->
    res.json result

server.post '/user/:target_username/dp/:value', (req, res) ->
  target_username = req.params.target_username
  dp = parseFloat req.params.value
  if dp == NaN
    res.statusCode = 400
    res.end "no dp"
    return
  user.setUserDp target_username, dp, ->
    res.end "ok"

server.get '/analytics/history', (req, res) ->
  name = req.query.name
  type = req.query.type
  page = req.query.page
  page = 1 if !page
  analytics.queryHistory name, type, page, (result) ->
    res.json result

server.get '/analytics/history/count', (req, res) ->
  name = req.query.name
  type = req.query.type
  analytics.queryHistoryCount name, type, (result) ->
    res.end result.toString()

# React Router File
server.get '*', (req, res) ->
  res.sendFile path.resolve('react-pages/build', 'index.html')

server.listen 9999