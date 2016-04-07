// 'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Dimensions
} from 'react-native';

const globalStyles = StyleSheet.create({
  font20: {
    fontSize: 20
  },
  textCenter: {
    textAlign: 'center'
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 250,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  },
  margin: {
    margin: 10
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
    contentContainer: {
    paddingVertical: 30,
    backgroundColor: 'white'
  },
  green: {
    color: 'green'
  },
  font25: {
    fontSize: 25
  },
    active: {
    color: '#007aff'
  }
});

var fullWidth = Dimensions.get('window').width;
var fullHeight = Dimensions.get('window').height;

export {
  globalStyles,
  fullWidth,
  fullHeight
}
