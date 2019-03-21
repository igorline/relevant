module.exports = {
  secrets: {
    session: process.env.SESSION_SECRET
  },
  userRoles: ['guest', 'user', 'admin'],

  facebook: {
    clientID: process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  reddit: {
    clientID: process.env.REDDIT_ID || 'id',
    clientSecret: process.env.REDDIT_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/reddit/callback'
  },

  twitter: {
    clientID: process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID: process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/google/callback'
  }
};
