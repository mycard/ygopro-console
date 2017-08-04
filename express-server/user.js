// Generated by CoffeeScript 2.0.0-beta3
(function() {
  var GET_MESSAGE_COUNT_SQL, GET_MESSAGE_SQL, PAGE_LIMIT, QUERY_MYCARD_IP_SQL, QUERY_MYCARD_SQL, QUERY_YGOPRO_SQL, SET_YGOPRO_DP_SQL, mycardPool, queryMessage, queryMessageCount, queryUser, queryUserViaIp, setUserDp, ygoproPool;

  ({mycardPool, ygoproPool} = require('./database'));

  PAGE_LIMIT = 100;

  QUERY_MYCARD_SQL = 'select * from users where name like $1::text or username like $1::text limit 200';

  QUERY_MYCARD_IP_SQL = 'select * from users where registration_ip_address like $1::text or ip_address like $1::text limit 200';

  QUERY_YGOPRO_SQL = 'select * from user_info where username = $1::text';

  SET_YGOPRO_DP_SQL = 'update user_info set pt = $2 where username = $1::text';

  GET_MESSAGE_SQL = `select * from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level > $2 limit ${PAGE_LIMIT} offset $3`;

  GET_MESSAGE_COUNT_SQL = 'select count(*) from message_history where (sender like $1::text or content like $1::text or match like $1::text) and level > $2';

  queryUser = function(user, callback) {
    return mycardPool.query(QUERY_MYCARD_SQL, [`%${user}%`], function(err, result) {
      var index, names;
      if (err) {
        console.log(err);
        callback.call(this, []);
        return;
      } else if (result.rows.length === 0) {
        callback.call(this, []);
        return;
      } else if (result.rows.length > 1) {
        names = result.rows.map(function(data) {
          return data.username;
        });
        index = names.indexOf(user);
        if (index < 0) {
          callback.call(this, names);
          return;
        } else {
          result.rows[0] = result.rows[index];
        }
      }
      return ygoproPool.query(QUERY_YGOPRO_SQL, [result.rows[0].username], function(err2, result2) {
        if (err2) {
          console.log(err2);
        }
        return callback.call(this, Object.assign(result.rows[0], result2.rows[0]));
      });
    });
  };

  queryUserViaIp = function(ip, callback) {
    ip = ip.replace("*", "%");
    return mycardPool.query(QUERY_MYCARD_IP_SQL, [`%${ip}%`], function(err, result) {
      if (err) {
        console.log(err);
        return callback.call(this, []);
      } else if (result.rows.length === 0) {
        return callback.call(this, []);
      } else {
        return callback.call(this, result.rows.map((user) => {
          return user.username;
        }));
      }
    });
  };

  setUserDp = function(user, dp, callback) {
    return ygoproPool.query(SET_YGOPRO_DP_SQL, [user, dp], function(err, result) {
      if (err) {
        console.log(err);
        return callback.call(this, null);
      } else {
        return callback.call(this, result);
      }
    });
  };

  queryMessage = function(keyword, level, page, callback) {
    console.log("call");
    return ygoproPool.query(GET_MESSAGE_SQL, [`%${keyword}%`, level, (page - 1) * PAGE_LIMIT], function(err, result) {
      console.log(result);
      if (err) {
        console.log(err);
        return callback.call(this, null);
      } else {
        return callback.call(this, result.rows);
      }
    });
  };

  queryMessageCount = function(keyword, level, callback) {
    return ygoproPool.query(GET_MESSAGE_COUNT_SQL, [`%${keyword}%`, level], function(err, result) {
      if (err) {
        console.log(err);
        return callback.call(this, null);
      } else {
        return callback.call(this, Math.ceil(result.rows[0].count / PAGE_LIMIT));
      }
    });
  };

  module.exports.queryUser = queryUser;

  module.exports.queryUserViaIp = queryUserViaIp;

  module.exports.setUserDp = setUserDp;

  module.exports.queryMessage = queryMessage;

  module.exports.queryMessageCount = queryMessageCount;

}).call(this);

//# sourceMappingURL=user.js.map
