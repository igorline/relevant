const blacklist = require('react-native/packager/blacklist');

module.exports = {
  getBlacklistRE: function() {
    return blacklist([/server\/.*/,/app\/web\/.*/,/\.env/,/publicenv/]);
  }
};
