data = require 'ygojs-data'
request = require 'request'
path = require 'path'
child = require 'child_process'
moment = require 'moment'
config = require './config.json'

lastPull =
  time: moment()

data.Environment.setConfig
  databasePath: path.join __dirname, "ygopro-database/locales/"

getCardData = (environmentName, name) ->
  environment = new data.Environment environmentName
  environment.clearCards()
  return null unless environment
  return environment.getCardByName name

pullDatabase = ->
  new Promise (resolve, reject) ->
    command = "git -C #{path.join __dirname, 'ygopro-database'} pull -f origin master"
    child.exec command, (err, stdout) ->
      lastPull.time = moment()
      if err then reject err else resolve stdout

broadcast = ->
  return unless config.databaseBroadcastList
  console.log "Sending database update broadcast...."
  for url in config.databaseBroadcastList
    request.post url, (err, res, body) ->
      if err
        console.log "#{res.statusCode} - Failed to broadcast database to #{url}"
      else
        console.log "#{res.statusCode} - Success to broadcast database to #{url}"


pushDatabase = (commit_message) ->

module.exports.lastPull = lastPull
module.exports.getCardData = getCardData
module.exports.pullDatabase = pullDatabase
module.exports.pushDatabase = pushDatabase
module.exports.broadcast = broadcast

pullDatabase()