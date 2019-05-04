express = require 'express'
path = require 'path'
_url = require 'url'
request = require 'request'
bodyParser = require 'body-parser'
moment = require 'moment'

user = require './user'
analytics = require './analytics'
update = require './update'
packager = require './packager'
config = require './config.json'
deckRouter = require './deckRecord'

timeRouter = require('./time').timeRouter
authorizeRouter = require('./author').authorizeRouter

server = express()

# React Static File
server.use express.static('react-pages/build')
server.use (req, res, next) ->
  res.header "Access-Control-Allow-Origin", "*"
  next()

server.use '/user/*', authorizeRouter
server.use '/user2/*', authorizeRouter
server.use '/analyze/*', authorizeRouter
#server.use '/updates/*', authorizeRouter
server.use '/profile/*', authorizeRouter

##############################
user2 = require './userN'
server.use '/user2', user2
##############################

server.get '/user/message', (req, res) ->
  keyword = req.query.keyword || ''
  level = parseInt(req.query.level) || 0
  page = parseInt(req.query.page) || 0
  user.queryMessage([keyword, level, page]).then (result) -> res.json result

server.get '/user/message/count', (req, res) ->
  keyword = req.query.keyword || ''
  level = parseInt(req.query.level) || 0
  user.queryMessageCount([keyword, level]).then (result) -> res.end result.toString()

server.get '/user/vote', (req, res) ->
  user.getVotes().then (votes) ->
    res.json votes

server.get '/user/vote/:id', (req, res) ->
  user.getVoteTickets(req.params.id).then (tickets) ->
    res.json tickets

server.post '/user/vote', bodyParser.text(), (req, res) ->
  user.saveVote(JSON.parse req.body).then -> res.end 'ok'

server.post '/user/id', bodyParser.text(), (req, res) ->
  user.queryUserViaIds(JSON.parse req.body).then (result) -> res.json result.rows

server.get '/user/ban', (req, res) ->
  page = parseInt(req.query.page) || 0
  user.queryBan([page]).then (result) -> res.json result

server.get '/user/ban/count', (req, res) ->
  user.queryBanCount([]).then (result) -> res.json result

server.get '/user/ban/:username', (req, res) ->
  name = req.params.username || ''
  result = await user.queryUserBanHistory(name)
  res.json result

server.get '/user/ban/:username/count', (req, res) -> res.end '1'

server.post '/user/ban/:username', (req, res) ->
  count = req.query.length || '1'
  count = parseInt(count) || 1
  name = req.params.username || ''
  await user.banUser(name, count)
  res.end 'ok'

server.get '/user/:target_username', (req, res) ->
  target_username = req.params.target_username
  res.json(await user.queryUser target_username)

server.get '/user/ip/:target_ip', (req, res) ->
  target_ip = req.params.target_ip
  user.queryUserViaIp target_ip, (result) ->
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

server.use '/analyze/*', timeRouter

server.get '/analyze/history', (req, res) ->
  name = req.query.name || ''
  type = req.query.type || ''
  type = '' if type == 'all'
  page = parseInt(req.query.page) || 1
  analytics.queryHistory([name ,type, req.start_time, req.end_time, page]).then (result) -> res.json result

server.get '/analyze/history/count', (req, res) ->
  name = req.query.name || ''
  type = req.query.type || ''
  type = '' if type == 'all'
  analytics.queryHistoryCount([name, type, req.start_time, req.end_time]).then (result) -> res.end result.toString()

server.get '/analyze/single', (req, res) ->
  name = req.query.name
  type = req.query.source || ''
  type = '' if type == 'all'
  page = parseInt(req.query.page) || 1
  result = await analytics.querySingle(name ,type, req.start_time, req.end_time, page)
  res.json result

server.get '/analyze/single/count', (req, res) ->
  name = req.query.name
  type = req.query.source || ''
  type = '' if type == 'all'
  result = await analytics.querySingleCount(name, type, req.start_time, req.end_time)
  res.end result.toString()

server.get '/analyze/deck', (req, res) ->
  name = req.query.name || ''
  source = req.query.source || ''
  page = parseInt(req.query.page) || 1
  analytics.queryDeck([name, source, req.start_time, req.end_time, page]).then (result) -> res.json result

server.get '/analyze/deck/count', (req, res) ->
  name = req.query.name
  source = req.query.source
  analytics.queryDeckCount([name, source, req.start_time, req.end_time]).then (result) -> res.end result.toString()

server.get '/analyze/tag', (req, res) ->
  name = (req.query.name || '') + "-"
  source = req.query.source || ""
  page = parseInt(req.query.page) || 1
  analytics.queryTag([name, source, req.start_time, req.end_time, page]).then (result) -> res.json result

server.get '/analyze/tag/count', (req, res) ->
  name = (req.query.name || '') + "-"
  source = req.query.source || ""
  analytics.queryTagCount([name, source, req.start_time, req.end_time]).then (result) -> res.json result

server.get '/analyze/count', (req, res) ->
  source = req.query.source
  result = await analytics.queryPureCount(source, req.start_time, req.end_time)
  res.end result.toString()

server.get '/analyze/custom', (req, res) ->
  analytics.runCommands(req.start_time, req.end_time).then (result) ->
    res.json result
  .catch (err) ->
    console.log err

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

server.get '/analyze/daily', (req, res) ->
  type = req.query.type
  analytics.dailyCount(type, req.start_time, req.end_time).then (result) ->
    res.json result
  .catch (result) ->
    res.statusCode = 500
    res.end result

server.get '/analyze/matchup', (req, res) ->
  source = req.query.source || "athletic"
  deckA = req.query.deckA || "迷之卡组"
  deckB = req.query.deckB
  period = req.query.period || moment().format("YYYY-MM")
  page = parseInt(req.query.page) || 1
  if deckB
    ans = await analytics.queryMatchup source, deckA, deckB, period
  else
    ans = await analytics.queryMatchupSingle source, deckA, period, page - 1
  res.json ans

server.get '/analyze/matchup/count', (req, res) ->
  source = req.query.source || "athletic"
  deckA  = req.query.deckA || "迷之卡组"
  deckB  = req.query.deckB
  period = req.query.period || moment().format("YYYY-MM")
  if deckB
    count = 1
  else
    count = await analytics.queryMatchupSingleCount source, deckA, period
  res.json count

server.get '/analyze/rank', (req, res) ->
  res.json await analytics.queryRank req.query.__start_time, req.query.__end_time
server.get '/analyze/rank/count', (req, res) ->
  res.end '1'

server.get '/updates/package', (req, res) ->
  packager.pack.then -> res.end 'ok'

server.get '/updates/refresh', (req, res) ->
  packager.refresh.then -> res.end 'ok'

server.get '/updates/card/:environment/:name', (req, res) ->
  environment = req.params.environment
  name = req.params.name
  res.json update.getCardData environment, name

server.get '/updates/pull/last', (req, res) ->
  res.end update.lastPull.time.toString()

server.post '/updates/pull', bodyParser.json(), (req, res) ->
  update.pullDatabase().then (result) ->
    res.end result.toString()
    update.broadcast()
  .catch (result) ->
    res.statusCode = 500
    res.end result.toString()

server.post '/updates/push', (req, res) ->
  update.pushDatabase()
  res.end 'ok'

server.use '/profile/identifier', (req, res) ->
  url = new _url.URL(config.deckIdentifier.host + req.url)
  url.searchParams.set 'accessKey', config.deckIdentifier.accessKey
  url.searchParams.delete 'sso'
  url.searchParams.delete 'sig'
  try
    req.pipe(request(url.toString(), { form: req.body })).pipe(res)
  catch
    res.end 500

deckRouter.router server

server.use '/images', (req, res) ->
  url = new _url.URL(config.imageServer.host + req.url)
  url.searchParams.set 'accessKey', config.imageServer.accessKey
  url.searchParams.delete 'sso'
  url.searchParams.delete 'sig'
  try
    req.pipe(request(url.toString(), { form: req.body })).pipe(res)
  catch
    res.end 500

#React Router File12
server.get '*', (req, res) ->
  res.sendFile path.resolve('react-pages/build', 'index.html')

server.listen 9999