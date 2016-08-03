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


var fullWidth = Dimensions.get('window').width;
var fullHeight = Dimensions.get('window').height;

const font = StyleSheet.create({
  font10: {
    fontSize: 10
  },
  font15: {
    fontSize: 15
  },
  font20: {
    fontSize: 20
  },
  font25: {
    fontSize: 25
  },
  font40: {
    fontSize: 40
  },
});

const colors = StyleSheet.create({
  green: {
    color: 'green'
  },
  active: {
    color: '#007aff'
  },
  white: {
    color: 'white'
  },
  gray: {
    color: 'gray'
  },
  darkGray: {
    color: '#555659'
  },
});

const alignment = StyleSheet.create({
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const layout = StyleSheet.create({
  activeBorder: {
    borderBottomWidth: 5,
    borderBottomColor: '#007aff',
    borderBottomStyle: 'solid',
  },
  typeParent: {
    paddingTop: 15,
    paddingBottom: 15,
    flex: 1,
    textAlign: 'center'
  },
  typeBar: {
    width: fullWidth,
    marginBottom: 10
  },
  type: {
    flex: 1,
    textAlign: 'center'
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    flex: 1,
    textAlign: 'center'
  },
  linkInput: {
    height: 50,
    width: fullWidth,
    padding: 10,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  onlineCirc: {
    backgroundColor: '#009E1D',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 5,
     marginRight: 5
  },
  offlineCirc: {
    backgroundColor: 'red',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 5,
    marginRight: 5
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tagBox: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    marginLeft: 5,
    marginTop: 5,
    fontSize: 15,
    color: '#808080'
  },
  singleTagBox: {
    backgroundColor: 'black',
    padding: 10,
    color: 'white'
  },
  tagStringContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 250,
    alignSelf: 'center'
  },
  authInput: {
    height: 35,
    width: 300,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 4,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  },
  margin: {
    margin: 10
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
  fullContainer: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
  },
  fullWidthStyle: {
    width: fullWidth,
  },
  flexRow: {
    flexDirection: 'row',
  },
  buttonParent: {
    flexDirection: 'row',
    padding: 10
  },
  buttonParentCenter: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center'
  },
  buttonText: {
    color: '#808080'
  },
  genericButton: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5
  },
  whiteButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5
  },
  padding10: {
    padding: 10
  },
  aniMoney: {
    position: 'absolute',
    top: -35,
    right: 10,
    backgroundColor: 'transparent'
  },
});

const globalStyles = {...colors, ...font, ...alignment, ...layout};

export {
  globalStyles,
  fullWidth,
  fullHeight
}
