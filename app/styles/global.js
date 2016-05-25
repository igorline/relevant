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

const globalStyles = StyleSheet.create({
  font20: {
    fontSize: 20
  },
  font15: {
    fontSize: 15
  },
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
    tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    tagX: {
    height: 7.5,
    width: 7.5,
    marginRight: 3.5
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

  font40: {
    fontSize: 40
  },
  font10: {
    fontSize: 10
  },
  pagination: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'red'
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: 40,
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  relevantSymbol: {
    fontSize: 25
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
    backgroundColor: 'lightgray',
    padding: 5,
    marginLeft: 5,
    marginTop: 5,
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
  marginTop: {
    marginTop: 10
  },
  margin: {
    margin: 10
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  white: {
    color: 'white'
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
  button: {
    color: '#007aff'
  },
  padding10: {
    padding: 10
  }
});


export {
  globalStyles,
  fullWidth,
  fullHeight
}
