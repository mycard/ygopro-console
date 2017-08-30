url = require 'url'

authorize = (sso, sig) ->
  return false if !(sso and sig)
  text = new Buffer(sso, 'base64').toString()
  parsedUrl = url.parse "http://127.0.0.1?" + text, true
  query = parsedUrl.query
  if query.admin == 'true' then query.username else null

formatQuery = (query) ->
  queries = []
  for key in Object.keys(query)
    queries.push "#{key} = #{query[key]}" if key != 'sso' and key != 'sig' and query[key] != ""
  if queries.length == 0 then "" else ", " + queries.join ", "

authorize_router = (req, res, next) ->
  sso = req.query.sso
  sig = req.query.sig
  if username = authorize sso, sig
    console.log "#{username} - #{req.method} #{req._parsedUrl.pathname}#{formatQuery(req.query)}"
    next()
  else
    res.statusCode = 403
    res.end "Not authorized"

module.exports.authorize = authorize
module.exports.authorizeRouter = authorize_router