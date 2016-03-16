/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
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


class Login extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      "message": null,
      "email": null,
      "password": null
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var message = '';
    var currentEmail = null;
    var currentPassword = null;

    this.state.email ? currentEmail = this.state.email : null;
    this.state.password ? currentPassword = this.state.password : null;
    this.state.message ? message = this.state.message : null;

    function logIn() {
      fetch('http://localhost:3000/auth/local', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: self.state.email,
          password: self.state.password
        })
      })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON, 'response');
        if (responseJSON.message) self.setState({"message": responseJSON.message})
        if (responseJSON.token) self.setState({"message": 'token ' + responseJSON.token})
      })
      .catch((error) => {
        console.warn(error, 'error');
        self.setState({"message": error})
      });
    }

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          You Relevant? { '\n' }Then log in.
        </Text>

        <Text style={styles.instructions}>
          {message}
        </Text>

        {/*<View style={styles.marginTop}>
          <Text style={styles.instructions}>
           {currentEmail ? currentEmail + '\n' : null}
           {currentPassword ? currentPassword + '\n' : null}
          </Text>
        </View>*/}

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="email" onChangeText={(email) => this.setState({"email": email})} value={this.state.email}  style={styles.input} />
        </View>
        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="password" onChangeText={(password) => this.setState({"password": password})} value={this.state.password}  style={styles.input} />
        </View>
        <View style={styles.marginTop}>
          <Button onPress={logIn} style={styles.button}>Log in</Button>
        </View>
      </View>
    );
  }
}

export default Login

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

