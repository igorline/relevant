import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles } from '../../styles/global';
import { NAME_PATTERN } from '../../utils/text';

let localStyles;
let styles;

class SignUp extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.validate = this.validate.bind(this);
    this.checkUser = this.checkUser.bind(this);
    this.devSkip = this.devSkip.bind(this);
    this.state = {
      message: '',
      name: null,
      phone: null,
      email: null,
      password: null,
      cPassword: null,
      nameError: null,
      emailError: null,
      twitter: true,
    };
  }

  componentWillMount() {
    if (this.props.auth.preUser) {
      this.setState({
        name: this.props.auth.preUser.name || null,
        phone: this.props.auth.preUser.phone || null,
        email: this.props.auth.preUser.email || null,
        password: this.props.auth.preUser.password || null,
        cPassword: this.props.auth.preUser.password || null
      });
    }
    if (this.props.scene && this.props.scene.email) {
      this.setState({
        email: this.props.scene.email.trim(),
        code: this.props.scene.code
      });
      setTimeout(() => this.checkEmail(), 100);
    }
  }

  componentDidMount() {
    // this.userInput.focus();
    codePush.disallowRestart();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.preUser && this.props.auth.preUser !== nextProps.auth.preUser) {
      this.setState({
        name: nextProps.auth.preUser.name || null,
        phone: nextProps.auth.preUser.phone || null,
        email: nextProps.auth.preUser.email || null,
        password: nextProps.auth.preUser.password || null,
        cPassword: nextProps.auth.preUser.password || null
      });
    }
  }

  checkEmail() {
    let string = this.state.email;
    let valid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(string);
    if (!valid) return this.setState({ emailError: 'invalid email' });

    this.props.actions.checkUser(string, 'email')
    .then((results) => {
      if (!results) {
        this.setState({ emailError: 'This email has already been used' });
      }
    });
    return null;
  }

  checkUser(name) {
    this.nameError = null;
    let toCheck = name || this.state.name;
    if (toCheck) {
      let string = toCheck;
      let match = NAME_PATTERN.test(string);
      if (match) {
        this.props.actions.checkUser(string, 'name')
        .then((results) => {
          if (!results) {
            this.usernameExists = true;
            this.nameError = 'This username is already taken';
          } else this.usernameExists = false;
          this.setState({});
        });
      } else {
        this.nameError = 'username can only contain letters, numbers, dashes and underscores';
      }
    }
  }

  // userError() {
  //   if (this.usernameExists) Alert.alert('Username already in use');
  // }

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
      return Alert.alert('Username already in use');
    }

    if (!NAME_PATTERN.test(this.state.name)) {
      return Alert.alert('username can only contain letters, numbers, dashes and underscores');
    }

    if (this.state.name) {
      if (this.state.name.length > 15) {
        return Alert.alert('name must be less than 15 characters');
      }
    } else {
      return Alert.alert('name required');
    }

    if (!this.state.email) {
      return Alert.alert('email required');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.state.email)) {
      return Alert.alert('invalid email address');
    } else if (this.state.emailError) {
      return Alert.alert(this.state.emailError);
    }

    // if (!this.state.phone) {
    //   Alert.alert('phone number required');
    //   return;
    // }

    if (this.state.password) {
      if (this.state.password !== this.state.cPassword) {
        return Alert.alert("Passwords don't match");
      }
    } else {
      return Alert.alert('Password required');
    }
    this.props.actions.setPreUser(user);
    console.log('saving pre user ', user);
    dismissKeyboard();
    this.props.actions.push({
      key: 'imageUpload',
      title: 'image',
      component: 'image',
      back: true
    }, 'auth');

    return null;
  }

  devSkip() {
    let randomNum = String(Math.floor(Math.random() * 1000));
    let randomName = 'test' + randomNum;
    let randomEmail = 'test' + randomNum + '@test.com';
    this.setState({
      name: randomName,
      email: randomEmail,
      password: 'test',
      cPassword: 'test'
    });

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
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
      >
        <ScrollView
          keyboardDismissMode={'interactive'}
          keyboardShouldPersistTaps={'always'}
          style={{ flex: 1 }}
          contentContainerStyle={styles.authScrollContent}
        >

          <View style={styles.fieldsInner}>

            <View style={styles.fieldsInputParent}>
              <TextInput
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="username"
                onChangeText={(name) => {
                  this.setState({ name: name.trim() });
                  this.checkUser(name.trim());
                }}
                value={this.state.name}
                style={styles.fieldsInput}
              />
            </View>
            { this.nameError ?
              <Text style={[styles.smallInfo, styles.error]}>{this.nameError}</Text> :
              null
            }
            <View style={styles.fieldsInputParent}>
              <TextInput
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholder="email"
                onBlur={() => this.checkEmail()}
                onChangeText={email => this.setState({ email: email.trim(), emailError: null })}
                value={this.state.email}
                style={styles.fieldsInput}
              />
            </View>
            { this.state.emailError ?
              <Text style={[styles.smallInfo, styles.error]}>{this.state.emailError}</Text> :
              null
            }

            <View style={styles.fieldsInputParent}>
              <TextInput
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                secureTextEntry
                keyboardType={'default'}
                placeholder="password"
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                underlineColorAndroid={'transparent'}
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

          <TouchableOpacity
            style={[styles.largeButton, { marginTop: 20 }]}
            onPress={this.validate}
          >
            <Text style={styles.largeButtonText}>next</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text
              style={[
                styles.signInText,
                styles.font12
              ]}
            >
              By signing up, you agree to our{' '}
              <Text
                style={[styles.signInText, styles.active, styles.font12]}
                onPress={() =>
                  this.props.actions.goToUrl('https://relevant.community/eula.html')
                }
              >
                Terms of Use
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

SignUp.propTypes = {
  actions: PropTypes.object,
  auth: PropTypes.object,
  scene: PropTypes.object,
  navigation: PropTypes.object, //navigation store
};


localStyles = StyleSheet.create({
  error: {
    marginTop: 5,
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default SignUp;

