{ Pool } = require 'pg'
Config = require './config.json'

module.exports.mycardPool = new Pool Config.mycardDatabase
module.exports.ygoproPool = new Pool Config.ygoproDatabase