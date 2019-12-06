const presets = [];
const plugins = [
  // need this because of class properties
  // plugin messing up flow types
  // https://github.com/babel/babel/issues/8417
  '@babel/plugin-transform-flow-strip-types',
  '@babel/transform-exponentiation-operator',
  '@babel/plugin-syntax-dynamic-import',
  '@loadable/babel-plugin',
  'styled-components',
  '@babel/plugin-proposal-class-properties',
  'inline-react-svg'
];

const prodPlugins = ['transform-remove-console'];
const nativePresets = ['module:metro-react-native-babel-preset'];
const presetsWeb = ['@babel/preset-env', '@babel/preset-react'];

const moduleResolverWeb = [
  'module-resolver',
  {
    root: ['./app', './app/modules'],
    extensions: ['.ios.js', '.android.js', '.js', '.json'],
    alias: {
      server: './server',
      modules: './app/modules',
      core: './app/core',
      app: './app',
      'react-native-svg$': 'react-native-web-svg',
      '^react-native$': 'react-native-web',
      'react-native-linear-gradient$': 'react-native-web-linear-gradient'
      // 'react-native-gesture-handler/DrawerLayout': './app/modules/ui/mobile/DrawerLayout'
    }
  }
];

const moduleResolverNative = [
  'module-resolver',
  {
    root: ['./app', './app/modules'],
    extensions: ['.ios.js', '.android.js', '.js', '.json'],
    alias: {
      server: './server',
      modules: './app/modules',
      core: './app/core',
      app: './app',
      'react-native-gesture-handler/DrawerLayout': './app/modules/ui/mobile/DrawerLayout'
    }
  }
];

const pluginsTest = ['@babel/plugin-transform-runtime'];

module.exports = api => {
  api.cache(false);

  // This is needed because react-native v 0.61.2 sets BABEL_ENV to 'undefined' at some point during the build process which fucks up the babel config
  const env =
    process.env.BABEL_ENV && process.env.BABEL_ENV !== 'undefined'
      ? process.env.BABEL_ENV
      : process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        plugins: [...plugins, ...prodPlugins, moduleResolverNative],
        presets: [...presets, ...nativePresets]
      };
    case 'development':
      return {
        plugins: [...plugins, moduleResolverNative],
        presets: [...presets, ...nativePresets]
      };
    case 'test':
      return {
        plugins: [...plugins, ...pluginsTest, moduleResolverWeb],
        presets: [...presetsWeb]
      };
    case 'development_web':
      return {
        plugins: [...plugins, moduleResolverWeb],
        presets: [...presetsWeb]
      };
    default:
      return {
        plugins: [...plugins, moduleResolverWeb],
        presets: [...presets]
      };
  }
};
