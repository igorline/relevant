'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native';
var Button = require('react-native-button');

class SignUp extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      "message": ''
    }
  }

  componentDidMount() {

  }

  componentDidUpdate() {
  }

  checkPass(user) {
    var self = this;
    if (self.state.password) {
      if (self.state.password == self.state.cPassword) {
        createUser(user);
      } else {;
        self.setState({message: "passwords don't match"});
      }
    } else {
      self.setState({message: 'no password'});
    }
  }

  validate() {
    var self = this;
    var user = {
      name: self.state.name,
      phone: self.state.phone,
      email: self.state.email,
      password: self.state.password
    }

    if (self.state.name) {
      if (self.state.name.length > 15) {
        self.setState({message: 'name must be less than 15 characters'});
        return;
      }
    } else {
      self.setState({message: 'name required'});
      return;
    }

    if (!self.state.email) {
      self.setState({message: 'email required'});
      return;
    } else {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(self.state.email)) {
        self.setState({message: 'invalid email address'});
        return;
      }
    }


    if (!self.state.phone) {
      self.setState({message: 'phone number required'});
      return;
    }


    if (self.state.password) {
      if (self.state.password != self.state.cPassword) {
        self.setState({message: "passwords don't match"});
        return;
      }
    } else {
      self.setState({message: 'password required'});
      return;
    }

    self.props.actions.createUser(user);
  }

  render() {
    var self = this;
    const { createUser } = this.props.actions;
    var message = self.state.message;
    var styles = this.props.styles;
    this.props.auth.statusText ? message = this.props.auth.statusText : null;



    return (
      <View style={styles.center}>

      <Text style={styles.instructions}>{message}</Text>

      <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="name" onChangeText={(name) => this.setState({"name": name})} value={this.state.name}  style={styles.input} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="email" onChangeText={(email) => this.setState({"email": email})} value={this.state.email}  style={styles.input} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='phone-pad' clearTextOnFocus={false} placeholder="phone number" onChangeText={(phone) => this.setState({"phone": phone})} value={this.state.phone}  style={styles.input} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="password" onChangeText={(password) => this.setState({"password": password})} value={this.state.password}  style={styles.input} />
        </View>

         <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="confirm password" onChangeText={(cPassword) => this.setState({"cPassword": cPassword})} value={this.state.cPassword}  style={styles.input} />
        </View>

        <View style={styles.margin}>
          <TouchableHighlight style={styles.genericButton} onPress={self.validate.bind(self)}><Text style={styles.white}>Submit</Text></TouchableHighlight>
        </View>

      </View>
    );
  }
}


export default SignUp

