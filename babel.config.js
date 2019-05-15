module.exports = {
  plugins: [
    // need this because of class properties
    // plugin messing up flow types
    // https://github.com/babel/babel/issues/8417
    ['@babel/plugin-transform-flow-strip-types'],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/transform-exponentiation-operator',
    '@loadable/babel-plugin',
    ['styled-components'],
    '@babel/plugin-proposal-class-properties',
    'inline-react-svg',
    [
      'module-resolver',
      {
        root: ['./app', './app/modules'],
        extensions: ['.ios.js', '.android.js', '.js', '.json'],
        alias: {
          server: './server',
          modules: './app/modules',
          core: './app/core',
          app: './app',
          'react-native-gesture-handler/DrawerLayout':
            './app/modules/ui/mobile/DrawerLayout'
        },
        cwd: 'babelrc'
      }
    ]
  ],
  env: {
    test: {
      plugins: [
        ['styled-components'],
        ['@babel/plugin-transform-runtime'],
        [
          'module-resolver',
          {
            root: ['./app', './app/modules'],
            alias: {
              server: './server',
              modules: './app/modules',
              core: './app/core',
              app: './app',
              '^react-native$': 'react-native-web',
              'react-native-linear-gradient$': 'react-native-web-linear-gradient'
            }
          }
        ]
      ],
      presets: [['@babel/preset-env'], '@babel/preset-react']
    },
    development_web: {
      plugins: [
        'styled-components',
        [
          'module-resolver',
          {
            root: ['./app', './app/modules'],
            alias: {
              server: './server',
              modules: './app/modules',
              core: './app/core',
              app: './app',
              '^react-native$': 'react-native-web',
              'react-native-linear-gradient$': 'react-native-web-linear-gradient'
            },
            cwd: 'babelrc'
          }
        ]
      ],
      presets: ['@babel/preset-env', '@babel/preset-react']
    },
    development: {
      presets: [['module:metro-react-native-babel-preset']]
    },
    production: {
      plugins: ['transform-remove-console'],
      presets: [['module:metro-react-native-babel-preset']]
    }
  }
};