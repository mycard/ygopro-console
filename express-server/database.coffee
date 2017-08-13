{ Pool } = require 'pg'
Config = require './config.json'
moment = require 'moment'

module.exports.mycardPool = new Pool Config.mycardDatabase
module.exports.ygoproPool = new Pool Config.ygoproDatabase

standardQueryCallback = (err, result, callback) ->
  if err
    console.log err
    callback.call this, null
  else
    callback.call this, result.rows

standardPromiseCallback = (resolve, reject, err, result) ->
  if err
    console.log err
    reject err
  else
    resolve result.rows

defineStandardQueryFunctions = (name, pool, standard_sql, count_sql, page_limit) ->
  result = {}
  formatArgs = (arg) =>
      if Number.isInteger(arg) then arg
      else if moment.isMoment(arg) then arg.format('YYYY-MM-DD HH:mm:ss')
      else return "%#{arg}%"
  result[name] = (args) =>
    args = args.map formatArgs
    args[args.length - 1] = (args[args.length - 1] - 1) * page_limit
    new Promise (resolve, reject) =>
      pool.query standard_sql, args, (err, result) => standardPromiseCallback(resolve, reject, err, result)
  result[name + 'Count'] = (args) ->
    args = args.map formatArgs
    new Promise (resolve, reject) =>
      pool.query count_sql, args, (err, result) =>
        if err
          resolve 0
        else
          resolve Math.ceil result.rows[0].count / page_limit
  result

module.exports.standardQueryCallback = standardQueryCallback
module.exports.standardPromiseCallback = standardPromiseCallback
module.exports.defineStandatdQueryFunctions = defineStandardQueryFunctions;