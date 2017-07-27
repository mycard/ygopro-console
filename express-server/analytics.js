// Generated by CoffeeScript 2.0.0-beta3
(function() {
  var HISTORY_COUNT_SQL, HISTORY_QUERY_SQL, PAGE_LIMIT, custom_commands, mycardPool, queryHistory, queryHistoryCount, runCommands, ygoproPool;

  ({mycardPool, ygoproPool} = require('./database'));

  custom_commands = require('./analytics.json');

  PAGE_LIMIT = 100;

  HISTORY_QUERY_SQL = `select * from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text order by start_time desc limit ${PAGE_LIMIT} offset $3`;

  HISTORY_COUNT_SQL = "select count(*) from battle_history where (usernamea like $1::text or usernameb like $1::text) and type like $2::text";

  runCommands = function(callback) {
    var answer, command, i, len, promises, target_pool;
    answer = [];
    promises = [];
    for (i = 0, len = custom_commands.length; i < len; i++) {
      command = custom_commands[i];
      let name = command.name;
      target_pool = command.target === 'mycard' ? mycardPool : ygoproPool;
      promises.push(target_pool.query(command.query).then(function(result) {
        return answer.push({
          name: name,
          result: result.rows
        });
      }));
    }
    return Promise.all(promises).then(function() {
      return callback.call(this, answer);
    });
  };

  queryHistory = function(name, type, start, callback) {
    if (type === 'all' || !type) {
      type = "%";
    }
    return ygoproPool.query(HISTORY_QUERY_SQL, [`%${name}%`, type, (start - 1) * PAGE_LIMIT], function(err, result) {
      if (err) {
        console.log(err);
        return callback.call(this, []);
      } else {
        return callback.call(this, result.rows);
      }
    });
  };

  queryHistoryCount = function(name, type, callback) {
    if (type === 'all' || !type) {
      type = "%";
    }
    return ygoproPool.query(HISTORY_COUNT_SQL, [`%${name}%`, type], function(err, result) {
      if (err) {
        console.log(err);
        return callback.call(this, 0);
      } else {
        return callback.call(this, Math.ceil(result.rows[0].count / PAGE_LIMIT));
      }
    });
  };

  module.exports.queryHistory = queryHistory;

  module.exports.queryHistoryCount = queryHistoryCount;

  module.exports.runCommands = runCommands;

}).call(this);

//# sourceMappingURL=analytics.js.map
