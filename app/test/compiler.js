var fs = require('fs');
var path = require('path');
var babel = require('babel-core');
var origJs = require.extensions['.js'];

require.extensions['.js'] = function (module, fileName) {
  var output;
  var ok = false;
  // console.log(fileName)
  //need to allow to transpile this module
  if (fileName.indexOf('node_modules/react-native-redux-router') >= 0 ) {
    ok = true;
  }
  //depends on some react stuff, so need to mock this
  if (fileName.indexOf('node_modules/react-native-redux-router/Animations') >= 0 ) {
    fileName = path.resolve('./app/test/router-animations.js');
  }
  //mock the react-native
  if (fileName.indexOf('node_modules/react-native/Libraries/react-native/react-native.js') >= 0) {
    fileName = path.resolve('./app/test/react-native.js');
  }
  if (fileName.indexOf('node_modules/') >= 0 && !ok) {
    return (origJs || require.extensions['.js'])(module, fileName);
  }
  // console.log("processing")
  var src = fs.readFileSync(fileName, 'utf8');
  output = babel.transform(src, {
    filename: fileName,
    sourceFileName: fileName,
    presets: ['react-native'],
  }).code;

  return module._compile(output, fileName);
};