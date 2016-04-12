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
    font40: {
    fontSize: 40
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
  },
    fullContainer: {
    flex: 1
  },
  buttonContainer: {
    padding:10,
    height:45,
    overflow:'hidden',
    borderRadius:4,
    backgroundColor: 'white',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'black',
    width:160,
    marginTop:20,
    marginBottom:20,
  },
  button: {
    fontSize: 20,
    color: 'black'
  }
});

var fullWidth = Dimensions.get('window').width;
var fullHeight = Dimensions.get('window').height;

export {
  globalStyles,
  fullWidth,
  fullHeight
}
