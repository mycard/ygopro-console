{ Pool } = require 'pg'
Config = require './config.json'

module.exports.mycardPool = new Pool Config.mycardDatabase
module.exports.ygoproPool = new Pool Config.ygoproDatabase

module.exports.standardQueryCallback = (err, result, callback) ->
  if err
    console.log err
    callback.call this, null
  else
    callback.call this, result.rows

module.exports.standardPromiseCallback = (resolve, reject, err, result) ->
  if err
    console.log err
    reject err
  else
    resolve result.rows
