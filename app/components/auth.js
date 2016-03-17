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
import Login from './login';

class Auth extends Component {
  componentDidMount() {
  }

  render() {
    var self = this;
    var auth;
    var message = '';
    console.log(this)
    // this.props.state.statusText ? message = this.props.state.statusText : null;
    const { isAuthenticated, user } = this.props.state;
    const { logout } = this.props.actions;


    if(isAuthenticated){
      auth = (
        <View style={styles.center}>
          <Text style={styles.welcome}>{user ? user.name : null}</Text>
          <Text>{message}</Text>
          <Button onPress={logout}>Logout</Button>
        </View>
        )
    }
    else {
      auth = (
        <Login { ...this.props }/>
      )
    }
    // else if( route.path == 'signup') {
    //   auth = (
    //     <Text>Sign up</Text>
    //   )
    // }

    return (
      <View style={styles.container}>
        {auth}
      </View>
    );
  }
}

export default Auth

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
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
  }
});

