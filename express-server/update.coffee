data = require 'ygojs-data'
path = require 'path'
child = require 'child_process'
moment = require 'moment'

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

pushDatabase = (commit_message) ->

module.exports.lastPull = lastPull
module.exports.getCardData = getCardData
module.exports.pullDatabase = pullDatabase
module.exports.pushDatabase = pushDatabase

pullDatabase()