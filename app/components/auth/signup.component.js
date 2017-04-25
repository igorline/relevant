import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  AlertIOS,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles, fullHeight } from '../../styles/global';

let localStyles;
let styles;

const NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;

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
  //   if (this.usernameExists) AlertIOS.alert('Username already in use');
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
      return AlertIOS.alert('Username already in use');
    }

    if (!NAME_PATTERN.test(this.state.name)) {
      return AlertIOS.alert('username can only contain letters, numbers, dashes and underscores');
    }

    if (this.state.name) {
      if (this.state.name.length > 15) {
        return AlertIOS.alert('name must be less than 15 characters');
      }
    } else {
      return AlertIOS.alert('name required');
    }

    if (!this.state.email) {
      return AlertIOS.alert('email required');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.state.email)) {
      return AlertIOS.alert('invalid email address');
    } else if (this.state.emailError) {
      return AlertIOS.alert(this.state.emailError);
    }

    // if (!this.state.phone) {
    //   AlertIOS.alert('phone number required');
    //   return;
    // }

    if (this.state.password) {
      if (this.state.password !== this.state.cPassword) {
        return AlertIOS.alert("Passwords don't match");
      }
    } else {
      return AlertIOS.alert('Password required');
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
    let randomEmail = 'test' +  randomNum + '@test.com';
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
        style={{ height: fullHeight - 60 }}
      >
        <ScrollView
          keyboardShouldPersistTaps={'always'}
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
                // onBlur={() => this.userError()}
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
              <Text style={styles.error}>{this.nameError}</Text> :
              null
            }
            <View style={styles.fieldsInputParent}>
              <TextInput
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
              <Text style={styles.error}>{this.state.emailError}</Text> :
              null
            }

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

          <Text style={[styles.font12, { textAlign: 'center', paddingBottom: 15 }]}>
            By clicking Next, you agree to our{' '}
            <Text
              style={styles.active}
              onPress={() =>
                this.props.actions.goToUrl('https://relevant.community/eula.html')
              }
            >
              Terms of Use
            </Text>
          </Text>

          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.largeButton]}
            onPress={this.validate}
          >
            <Text style={styles.largeButtonText}>next</Text>
          </TouchableHighlight>

        </ScrollView>
      </KeyboardAvoidingView>
    );
          // <TouchableHighlight
          //   onPress={this.devSkip}
          //   underlayColor={'transparent'}
          // >
          //   <Text style={styles.signInText}>
          //     <Text style={{ color: '#3E3EFF' }}>devSkip</Text>
          //   </Text>
          // </TouchableHighlight>
  }
}

SignUp.propTypes = {
  actions: React.PropTypes.object,
};

localStyles = StyleSheet.create({
  error: {
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default SignUp;

