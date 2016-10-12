import mockery from 'mockery'

require('isomorphic-fetch');

// inject __DEV__
global.__DEV__ = true

// We enable mockery and leave it on.
mockery.enable()

// Silence mockery's warnings as we'll opt-in to mocks instead
mockery.warnOnUnregistered(false)

var token;

mockery.registerMock('react-native-user-defaults', {
  remove: () => {
    token = null;
    return Promise.resolve()
  },
  set: (_token) => {
    token = _token;
    return Promise.resolve()
  },
  get: () => Promise.resolve(token)
});