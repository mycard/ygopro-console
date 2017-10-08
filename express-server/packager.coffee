config = require './config.json'
request = require 'request'

pack = ->
  Promise.new (resolve, reject) ->
    url = config.updateServer.packageHost + "pack?access_key=" + config.updateServer.password
    request.post url, (err, res, body) ->
      resolve 'ok'

refresh = ->
  Promise.new (resolve, reject) ->
    url = config.updateServer.serverHost + "clear?access_key=" + config.updateServer.password
    request.post url, (err, res, body) ->
      resolve 'ok'