database = require './database'
express = require 'express'

module.exports = () ->
  route = express.Router()

  route.quick_get = (path, func, param_patterns) ->
    names = Object.keys param_patterns
    types = Object.values param_patterns
    route.get path, (req, res) ->
      function_params = database.formatRequestParams types, names, Object.assign req.query, req.params
      #console.log names, types, '->', function_params
      res.json await func.call route, ...function_params

  route.quick_post = (path, func, param_patterns) ->
    names = Object.keys param_patterns
    types = Object.values param_patterns
    route.post path, (req, res) ->
      function_params = database.formatRequestParams types, names, Object.assign req.query, req.params
      res.json await func.call route, ...function_params

  route.quick = (name, path, func, param_patterns) ->
    names = Object.keys param_patterns
    types = Object.values param_patterns
    route[name].call route, path, (req, res) ->
      function_params = database.formatRequestParams types, names, Object.assign req.query, req.params
      res.json await func.call route, ...function_params

  route.count_get = (path, func, param_patterns) ->
    names = Object.keys param_patterns
    types = Object.values param_patterns
    route.get path + "/count", (req, res) ->
      function_params = database.formatRequestParams types, names, Object.assign req.query, req.params
      #console.log names, types, '->', function_params
      res.json await func.call route, ...function_params, -1
    param_patterns["page"] = "i"
    this.quick_get path, func, param_patterns

  route