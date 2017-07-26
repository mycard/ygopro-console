url = require 'url'

authorize = (sso, sig) ->
  return false if !(sso and sig)
  text = new Buffer(sso, 'base64').toString()
  parsedUrl = url.parse "http://127.0.0.1?" + text, true
  query = parsedUrl.query
  return query.admin == 'true'

module.exports.authorize = authorize