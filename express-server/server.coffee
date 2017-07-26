express = require 'express'
user = require './user'
author = require('./author').authorize
path = require 'path'

server = express()

# React Static File
server.use express.static('react-pages/build')

server.use '/user/*', (req, res, next) ->
  sso = req.query.sso
  sig = req.query.sig
  if author sso, sig
    next()
  else
    res.statusCode = 403
    res.end "Not authorized"

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
  user.setUserDp target_username, dp, (result) ->
    res.end "ok"

# React Router File
server.get '*', (req, res) ->
  res.sendFile path.resolve('react-pages/build', 'index.html')

server.listen 9999