'use strict';
import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Dimensions,
  AlertIOS,
  Keyboard,
} from 'react-native';
import { globalStyles } from '../styles/global';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';

class SignUp extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.validate = this.validate.bind(this);
    this.state = {
      message: '',
      visibleHeight: Dimensions.get('window').height,
    };
  }

  componentDidMount() {
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    const newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide(e) {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }

  back() {
    this.props.actions.pop(0);
  }

  checkPass(user) {
    var self = this;
    if (self.state.password) {
      if (self.state.password == self.state.cPassword) {
        createUser(user);
      } else {;
        AlertIOS.alert("passwords don't match");
      }
    } else {
      AlertIOS.alert('no password');
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
         AlertIOS.alert('name must be less than 15 characters');
        return;
      }
    } else {
      AlertIOS.alert('name required');
      return;
    }

    if (!self.state.email) {
      AlertIOS.alert('email required');
      return;
    } else {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(self.state.email)) {
        AlertIOS.alert('invalid email address');
        return;
      }
    }


    if (!self.state.phone) {
      AlertIOS.alert('phone number required');
      return;
    }


    if (self.state.password) {
      if (self.state.password != self.state.cPassword) {
        AlertIOS.alert("Passwords don't match");
        return;
      }
    } else {
       AlertIOS.alert('Password required');
      return;
    }

    self.props.actions.createUser(user);
  }

  componentWillUpdate(nextProps, nextState) {
    var self = this;
    if (nextProps.auth.statusText && !self.props.auth.statusText) {
       AlertIOS.alert(nextProps.auth.statusText);
    }
  }

  render() {
    var self = this;
    const { createUser } = this.props.actions;
    var message = self.state.message;
    var styles = globalStyles;
    this.props.auth.statusText ? message = this.props.auth.statusText : null;

    return (
      <View style={[{height: self.state.visibleHeight, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center'}]}>
         <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>
            Get Relevant {'\n'} Sign up
          </Text>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="name" onChangeText={(name) => this.setState({"name": name})} value={this.state.name}  style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="email" onChangeText={(email) => this.setState({"email": email})} value={this.state.email}  style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='phone-pad' clearTextOnFocus={false} placeholder="phone number" onChangeText={(phone) => this.setState({"phone": phone})} value={this.state.phone}  style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="password" onChangeText={(password) => this.setState({"password": password})} value={this.state.password}  style={styles.authInput} />
        </View>

         <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="confirm password" onChangeText={(cPassword) => this.setState({"cPassword": cPassword})} value={this.state.cPassword}  style={styles.authInput} />
        </View>

        <View style={styles.margin}>
          <TouchableHighlight style={[styles.whiteButton]} onPress={self.validate}><Text style={styles.buttonText}>Submit</Text></TouchableHighlight>
        </View>

        <TouchableHighlight style={[styles.whiteButton]} onPress={self.back}><Text style={styles.buttonText}>Back</Text></TouchableHighlight>

      </View>
    );
  }
}

SignUp.propTypes = {
  actions: React.PropTypes.object,
};

export default SignUp;

// function mapStateToProps(state) {
//   return {
//     auth: state.auth,
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators({
//       ...authActions,
//     }, dispatch),
//   };
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SignUp);

