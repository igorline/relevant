'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
var Button = require('react-native-button');

class discoverUser extends Component {

  render() {
    var self = this;
    var user = null;
    if (self.props.user) {
      user = self.props.user;
    }

    return (
      <View style={styles.center}>
       <Text style={styles.welcome}>{user ? user.name : null}</Text>
      </View>
    );
  }
}

export default discoverUser

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  green: {
    color: 'green',
    fontSize: 25
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
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
  }
});

