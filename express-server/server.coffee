express = require 'express'
path = require 'path'
bodyParser = require 'body-parser'
user = require './user'
analytics = require './analytics'
authorizeRouter = require('./author').authorizeRouter

server = express()

# React Static File
server.use express.static('react-pages/build')

server.use '/user/*', authorizeRouter
server.use '/analyze/*', authorizeRouter

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

server.get '/analyze/history', (req, res) ->
  name = req.query.name
  type = req.query.type
  page = req.query.page
  page = 1 if !page
  analytics.queryHistory name, type, page, (result) ->
    res.json result

server.get '/analyze/history/count', (req, res) ->
  name = req.query.name
  type = req.query.type
  analytics.queryHistoryCount name, type, (result) ->
    res.end result.toString()

server.get '/analyze/deck', (req, res) ->
  name = req.query.name
  page = req.query.page
  page = 1 if !page
  analytics.queryDeck name, page, (result) ->
    res.json result

server.get '/analyze/deck/count', (req, res) ->
  name = req.query.name
  analytics.queryDeckCount name, (result) ->
    res.end result.toString()

server.get '/analyze/custom', (req, res) ->
  analytics.runCommands (result) ->
    res.json result

server.get '/analyze/custom/commands', (req, res) ->
  res.sendFile path.resolve('express-server', 'analytics.json')

textParser = bodyParser.text()
server.post '/analyze/custom/commands', textParser, (req, res) ->
  try
    commands = JSON.parse req.body
  catch
    res.statusCode = 400
    res.end "Not correct json"
  analytics.setCommands commands
  res.end 'ok'

# React Router File
server.get '*', (req, res) ->
  res.sendFile path.resolve('react-pages/build', 'index.html')

server.listen 9999