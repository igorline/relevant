/* eslint-disable */

var ConvId;

exports.TwitterCT = {
  init: function(convId) {
    ConvId = convId;
    !(function(e, t, n, s, u, a) {
      e.twq ||
        ((s = e.twq = function() {
          s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
        }),
        (s.version = '1.1'),
        (s.queue = []),
        (u = t.createElement(n)),
        (u.async = !0),
        (u.src = '//static.ads-twitter.com/uwt.js'),
        (a = t.getElementsByTagName(n)[0]),
        a.parentNode.insertBefore(u, a));
    })(window, document, 'script');
    if (!ConvId) {
      console.error('TwitterConvTrkr.init(convId) missing conversion id.');
      return;
    } else {
      twq('init', ConvId);
    }
  },

  signUp: function() {
    if (!ConvId) {
      console.error('TwitterConvTrkr init must be called first.');
      return;
    }
    twq('track', 'Purchase', { value: 1 });
  },

  pageView: function() {
    if (!ConvId) {
      console.error('TwitterConvTrkr init must be called first.');
      return;
    }
    twq('track', 'PageView');
  }
};
