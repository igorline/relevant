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
  TouchableOpacity,
  StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles, IphoneX } from 'app/styles/global';
import { NAME_PATTERN } from 'app/utils/text';
import get from 'lodash/get';
import { colors } from 'styles';

let localStyles;
let styles;

class SignUp extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
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
      twitter: true
    };
  }

  componentWillMount() {
    const params = get(this.props.navigation, 'state.params');
    if (this.props.auth.preUser) {
      this.setState({
        name: this.props.auth.preUser.name || null,
        phone: this.props.auth.preUser.phone || null,
        email: this.props.auth.preUser.email || null,
        password: this.props.auth.preUser.password || null,
        cPassword: this.props.auth.preUser.password || null
      });
    }
    if (params && params.email) {
      this.setState({
        email: params.email.trim(),
        code: params.code
      });
      setTimeout(() => this.checkEmail(), 100);
    }
  }

  componentDidMount() {
    // this.userInput.focus();
    codePush.disallowRestart();
  }

  componentDidUpdate(prev) {
    const { auth } = this.props;
    if (auth.preUser && prev.auth.preUser !== auth.preUser) {
      this.setState({
        name: auth.preUser.name || null,
        phone: auth.preUser.phone || null,
        email: auth.preUser.email || null,
        password: auth.preUser.password || null,
        cPassword: auth.preUser.password || null
      });
    }
  }

  checkEmail() {
    const string = this.state.email;
    const valid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(string);
    if (!valid) return this.setState({ emailError: 'invalid email' });

    this.props.actions.checkUser(string, 'email').then(results => {
      if (results) {
        this.setState({ emailError: 'This email has already been used' });
      }
    });
    return null;
  }

  checkUser(name) {
    this.nameError = null;
    const toCheck = name || this.state.name;
    if (toCheck) {
      const string = toCheck;
      const match = NAME_PATTERN.test(string);
      if (match) {
        this.props.actions.checkUser(string, 'name').then(results => {
          if (results) {
            this.usernameExists = true;
            this.nameError = 'This username is already taken';
          } else this.usernameExists = false;
          this.setState({});
        });
      } else {
        this.nameError =
          'username can only contain letters, numbers, dashes and underscores';
      }
    }
  }

  validate() {
    const user = {
      name: this.state.name,
      phone: this.state.phone,
      email: this.state.email,
      password: this.state.password
    };

    if (this.usernameExists) {
      return Alert.alert('this username is taken');
    }

    if (!NAME_PATTERN.test(this.state.name)) {
      return Alert.alert(
        'username can only contain letters, numbers, dashes and underscores'
      );
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
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.state.email)) {
      return Alert.alert('invalid email address');
    }
    if (this.state.emailError) {
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
    dismissKeyboard();
    this.props.actions.push({
      key: 'imageUpload',
      title: 'image'
    });

    return null;
  }

  devSkip() {
    const randomNum = String(Math.floor(Math.random() * 1000));
    const randomName = 'test' + randomNum;
    const randomEmail = 'test' + randomNum + '@test.com';
    this.setState({
      name: randomName,
      email: randomEmail,
      password: 'test',
      cPassword: 'test'
    });
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={
          Platform.OS === 'android' ? StatusBar.currentHeight / 2 + 64 : IphoneX ? 88 : 64
        }
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
                placeholderTextColor={colors.grey}
                placeholder="username"
                onChangeText={name => {
                  this.setState({ name: name.trim() });
                  this.checkUser(name.trim());
                }}
                value={this.state.name}
                style={styles.fieldsInput}
              />
            </View>
            {this.nameError ? (
              <Text style={[styles.smallInfo, styles.error]}>{this.nameError}</Text>
            ) : null}
            <View style={styles.fieldsInputParent}>
              <TextInput
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholderTextColor={colors.grey}
                placeholder="email"
                onBlur={() => this.checkEmail()}
                onChangeText={email =>
                  this.setState({ email: email.trim(), emailError: null })
                }
                value={this.state.email}
                style={styles.fieldsInput}
              />
            </View>
            {this.state.emailError ? (
              <Text style={[styles.smallInfo, styles.error]}>
                {this.state.emailError}
              </Text>
            ) : null}

            <View style={styles.fieldsInputParent}>
              <TextInput
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                secureTextEntry
                keyboardType={'default'}
                placeholderTextColor={colors.grey}
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
                placeholderTextColor={colors.grey}
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

          <TouchableOpacity
            onPress={() =>
              this.props.actions.goToUrl('https://relevant.community/eula.html')
            }
          >
            <Text style={[styles.signInText, styles.font12]}>
              By signing up, you agree to our{' '}
              <Text style={[styles.signInText, styles.active, styles.font12]}>
                Terms of Use
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

localStyles = StyleSheet.create({
  error: {
    marginTop: 5,
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default SignUp;
