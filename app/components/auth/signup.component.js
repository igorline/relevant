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
import { globalStyles, fullHeight, fullWidth } from '../../styles/global';

let localStyles;
let styles;

const NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;

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
      nameError: null,
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

  checkUsername(name) {
    this.nameError = null;
    let toCheck = name || this.state.name;
    if (toCheck) {
      let string = toCheck;
      let match = NAME_PATTERN.test(string);
      if (match) {
        this.props.actions.checkUsername(string)
        .then((results) => {
          if (!results) {
            this.usernameExists = true;
            this.nameError = 'This username is already taken';
          }
          else this.usernameExists = false;
          this.setState();
        });
      } else {
        // AlertIOS.alert('username can only contain letters, numbers, dashes and underscores');
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
      AlertIOS.alert('Username already in use');
      return;
    }

    if (!NAME_PATTERN.test(this.state.name)) {
      AlertIOS.alert('username can only contain letters, numbers, dashes and underscores');
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
                // onBlur={() => this.userError()}
                placeholder="username"
                onChangeText={(name) => { this.setState({ name }); this.checkUsername(name) }}
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
  error: {
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default SignUp;

