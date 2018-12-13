
/*
 * subdomain middleware
 * slightly modified from https://github.com/edwardhotchkiss/subdomain
 * keep shipping next()
 */

module.exports = function (options) {
  // options?
  options = options || {};

  if (!options.base) {
    throw new Error('options.base required!');
  } else {
    options.removeWWW = options.removeWWW || false;
    options.debug = options.debug || false;
    options.ignoreWWW = options.ignoreWWW || false;
    options.prefix = options.prefix || 'subdomain';
  }

  // return middleware
  return function (request, response, next) {
    // get host & protocol
    const host = request.headers.host;
    const protocol = request.socket.encrypted ? 'https' : 'http';
    // Invalid request, since headers.host should be set, most likely a malicious attempt
    if (!host) {
      return response.sendStatus(400);
    }

    // remove 'www' prefix from URL? (tacky, right?)
    if (options.removeWWW === true) {
      if (/^www/.test(host)) {
        return response.redirect(protocol + '://' + host.replace(/^www\./, '') + request.url);
      }
    }

    // subdomain specific middleware
    if (host === options.base || host === 'localhost:8000' || (options.ignoreWWW && /^www\./.test(host))) {
      // not a subdomain or ignoring www subdomain
      next();
    } else {
      // test for subdomain
      const matches = host.match(new RegExp('(.*)\.' + options.base));
      // subdomain
      if (matches && matches.length === 2) {
        // request.url = '/' + options.prefix + '/' + matches[1] + request.url;
        request.subdomain = matches[1].split('.')[0];
        next();
      } else {
        next();
      }
    }
  };
};
