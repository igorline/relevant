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
    }
  }

  componentDidMount() {

  }

  componentDidUpdate() {
  }

  render() {
    var self = this;
    const { loginUser } = this.props.actions;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;

    return (
      <View style={styles.center}>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="email" onChangeText={(email) => this.setState({"email": email})} value={this.state.email} style={styles.input} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="password" onChangeText={(password) => this.setState({"password": password})} value={this.state.password} style={styles.input} />
        </View>

        <View style={styles.margin}>
          <Button onPress={loginUser.bind(null, JSON.stringify({email: self.state.email, password: self.state.password}))} style={styles.button}>Submit</Button>
        </View>

      </View>
    );
  }
}


export default Login

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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

