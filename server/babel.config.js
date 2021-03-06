module.exports = {
  presets: [['@babel/preset-env'], '@babel/preset-react'],
  plugins: [
    'espower',
    '@babel/plugin-transform-runtime',
    '@loadable/babel-plugin',
    '@babel/plugin-proposal-class-properties',
    'inline-react-svg',
    ['styled-components'],
    [
      'module-resolver',
      {
        alias: {
          server: './server',
          modules: './app/modules',
          core: './app/core',
          app: './app',
          'react-native-svg$': 'react-native-web-svg',
          '^react-native$': 'react-native-web',
          'react-native-linear-gradient$': 'react-native-web-linear-gradient'
        }
      }
    ]
  ]
};
