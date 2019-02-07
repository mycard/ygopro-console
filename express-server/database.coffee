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
      else return formatText(arg)
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

formatText = (str) ->
  return "" if str == null || str == undefined
  return "%" if str == ""
  return str.substring(1, str.length - 1) if str.startsWith '"' and str.endsWith '"'
  ans = "%#{str}%".replace(/%%/g, "")
  ans = ans.substring 2 if ans.startsWith "%^"
  ans = ans.substring 0, ans.length - 2 if ans.endsWith "$%"
  ans

formatTime = (str) ->
  return moment(str).format('YYYY-MM-DD HH:mm:ss')

formatInt = (str) ->
  return parseInt(str || "0") || 0

formatFloat = (str) ->
  return parseFloat(str || "0") || 0

formatParam = (type, param) ->
  switch type
    when 's' then return formatText param
    when 't' then return formatTime param
    when 'i' then return formatInt param
    when 'f' then return formatFloat param
    when 'o' then return param
    else return param

formatParams = (types, params) ->
  new Array(...params).map (param, index) -> formatParam(types[index], param)
  
formatRequestParams = (types, names, params) ->
  formatParams(types, names.map (name) -> params[name])

standardPGQuery = (pool, sql, params) ->
  res = await pool.query(sql, params).catch (err) ->
    console.log "Failed exec sql: #{sql} [#{params}] for #{err}\n#{err.stack}"
    { rows: [] }
  return res.rows

standardCountedPGQuery = (pool, query_sql, count_sql, params, limit_count = Config.limitCount) ->
  if params[params.length - 1] < 0
    sql = count_sql
    params.splice params.length - 1
    rows = await standardPGQuery pool, sql, params
    return Math.ceil(rows[0].count / limit_count)
  else
    sql = query_sql
    params[params.length - 1] = (params[params.length - 1] - 1) * limit_count
    return await standardPGQuery pool, sql, params

module.exports.standardQueryCallback = standardQueryCallback
module.exports.standardPromiseCallback = standardPromiseCallback
module.exports.defineStandardQueryFunctions = defineStandardQueryFunctions
module.exports.formatTime = formatTime
module.exports.formatText = formatText
module.exports.formatFloat = formatFloat
module.exports.formatInt = formatInt
module.exports.formatParam = formatParam
module.exports.formatParams = formatParams
module.exports.formatRequestParams = formatRequestParams
module.exports.standardPGQuery = standardPGQuery
module.exports.standardCountedPGQuery = standardCountedPGQuery