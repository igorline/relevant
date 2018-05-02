const blacklist = require('metro/src/blacklist');

module.exports = {
  getBlacklistRE: function() {
    return blacklist([/server\/.*/, /app\/web\/.*/, /\.env/, /publicenv/]);
  }
};
