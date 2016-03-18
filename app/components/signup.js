'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
// import {reduxForm} from 'redux-form';
var Button = require('react-native-button');

class SignUp extends Component {

  // constructor (props, context) {
  //   super(props, context)
  //   this.state = {
  //     "message": null
  //   }
  // }

  componentDidMount() {

  }

  componentDidUpdate() {
    // console.log(this.props, 'login props')
  }

  render() {
    var self = this;
    // console.log(this)
    // var currentEmail = null;
    // var currentPassword = null;
    // this.state.email ? currentEmail = this.state.email : null;
    // this.state.password ? currentPassword = this.state.password : null;
    // const { loginUser } = this.props.actions;
    // var message = '';
    // this.props.auth.statusText ? message = this.props.auth.statusText : null;

    return (
      <View style={styles.center}>
        <View style={styles.margin}>
         <Text>Sign Up</Text>
        </View>
      </View>
    );
  }
}


export default SignUp

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

