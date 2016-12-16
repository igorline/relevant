import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Dimensions,
  AlertIOS,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { globalStyles, fullHeight, fullWidth } from '../styles/global';

let localStyles;
let styles;

class SignUp extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.validate = this.validate.bind(this);
    this.checkUsername = this.checkUsername.bind(this);
    this.devSkip = this.devSkip.bind(this);
    this.state = {
      message: '',
      name: null,
      phone: null,
      email: null,
      password: null,
      cPassword: null,
    };
  }

  componentDidMount() {
    if (this.props.auth.preUser) {
      this.setState({
        name: this.props.auth.preUser.name || null,
        phone: this.props.auth.preUser.phone || null,
        email: this.props.auth.preUser.email || null,
        password: this.props.auth.preUser.password || null
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this, 'signup this')
    if (nextProps.auth.statusText && !this.props.auth.statusText) {
      AlertIOS.alert(nextProps.auth.statusText);
    }
    if (nextProps.auth.preUser && this.props.auth.preUser !== nextProps.auth.preUser) {
      this.setState({
        name: nextProps.auth.preUser.name || null,
        phone: nextProps.auth.preUser.phone || null,
        email: nextProps.auth.preUser.email || null,
        password: nextProps.auth.preUser.password || null
      });
    }
  }

  componentWillUnmount() {
  }

  checkUsername() {
    console.log('check username');
    if (this.state.name) {
      let pattern = /^[a-zA-Z0-9-_]+$/;
      let string = this.state.name;
      let match = pattern.test(string);
      if (match) {
        this.props.actions.checkUsername(string)
        .then(results => {
          if (!results) {
            this.usernameExists = true;
            AlertIOS.alert('Username already in use');
          } else {
            this.usernameExists = false;
          }
          console.log('username good?', results);
        });
      } else {
        AlertIOS.alert('username can only contain letters, numbers, dashes and underscores');
      }
    }
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  validate() {
    const user = {
      name: this.state.name,
      phone: this.state.phone,
      email: this.state.email,
      password: this.state.password
    };

    if (this.usernameExists) {
      AlertIOS.alert('username already exist');
      return;
    }

    if (this.state.name) {
      if (this.state.name.length > 15) {
        AlertIOS.alert('name must be less than 15 characters');
        return;
      }
    } else {
      AlertIOS.alert('name required');
      return;
    }

    if (!this.state.email) {
      AlertIOS.alert('email required');
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.state.email)) {
      AlertIOS.alert('invalid email address');
      return;
    }

    // if (!this.state.phone) {
    //   AlertIOS.alert('phone number required');
    //   return;
    // }

    if (this.state.password) {
      if (this.state.password !== this.state.cPassword) {
        AlertIOS.alert("Passwords don't match");
        return;
      }
    } else {
      AlertIOS.alert('Password required');
      return;
    }
    this.props.actions.setPreUser(user);
    console.log('saving pre user ', user);
    this.props.actions.push({
      key: 'imageUpload',
      title: 'image',
      showBackButton: true
    }, this.props.navigation.main);
    // this.props.actions.createUser(user);
  }

  devSkip() {
    this.setState({
      name: 'test',
      phone: '212',
      email: 'test3@test.com',
      password: 'test',
      cPassword: 'test'
    })

    // this.props.actions.setPreUser(user);
    // this.props.actions.push({
    //   key: 'imageUpload',
    //   title: 'image',
    //   showBackButton: true
    // }, this.props.navigation.main);
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ height: fullHeight - 60 }}
      >
        <ScrollView
          keyboardShouldPersistTaps
          keyboardDismissMode={'interactive'}
          scrollEnabled={false}
          contentContainerStyle={styles.fieldsParent}
        >

          <View style={styles.fieldsInner}>

            <View style={styles.fieldsInputParent}>
              <TextInput
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'default'}
                clearTextOnFocus={false}
                onBlur={() => this.checkUsername()}
                placeholder="username"
                onChangeText={name => this.setState({ name })}
                value={this.state.name}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholder="email"
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
                style={styles.fieldsInput}
              />
            </View>

            {/*<View style={styles.fieldsInputParent}>
              <TextInput
                autoCapitalize={'none'}
                keyboardType={'phone-pad'}
                clearTextOnFocus={false}
                placeholder="phone number"
                onChangeText={phone => this.setState({ phone })}
                value={this.state.phone} style={styles.fieldsInput}
              />
            </View>*/}

            <View style={styles.fieldsInputParent}>
              <TextInput
                autoCapitalize={'none'}
                secureTextEntry
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="password"
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                autoCapitalize={'none'}
                secureTextEntry
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="confirm password"
                onChangeText={cPassword => this.setState({ cPassword })}
                value={this.state.cPassword}
                style={styles.fieldsInput}
              />
            </View>
          </View>

          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.largeButton]}
            onPress={this.validate}
          >
            <Text style={styles.largeButtonText}>next</Text>
          </TouchableHighlight>
                <TouchableHighlight
        onPress={this.devSkip}
        underlayColor={'transparent'}
      >
        <Text style={styles.signInText}>
          <Text style={{ color: '#3E3EFF' }}>devSkip</Text>
        </Text>
      </TouchableHighlight>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

SignUp.propTypes = {
  actions: React.PropTypes.object,
};

localStyles = StyleSheet.create({
});


export default SignUp;

