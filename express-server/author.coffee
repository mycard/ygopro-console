url = require 'url'

authorize = (sso, sig) ->
  return false if !(sso and sig)
  text = new Buffer(sso, 'base64').toString()
  parsedUrl = url.parse "http://127.0.0.1?" + text, true
  query = parsedUrl.query
  return query.admin == 'true'

authorize_router = (req, res, next) ->
  sso = req.query.sso
  sig = req.query.sig
  if authorize sso, sig
    next()
  else
    res.statusCode = 403
    res.end "Not authorized"

module.exports.authorize = authorize
module.exports.authorizeRouter = authorize_router