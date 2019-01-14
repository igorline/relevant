import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import { globalStyles, IphoneX } from 'app/styles/global';
import { NAME_PATTERN } from 'app/utils/text';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import TwitterButton from './TwitterButton.component';

let styles;

export default class TwitterSignup extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object,
    admin: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      username: ''
    };
    this.renderUserName = this.renderUserName.bind(this);
    this.signUp = this.signUp.bind(this);
    this.checkUser = this.checkUser.bind(this);
  }

  componentDidMount() {
    codePush.disallowRestart();
  }

  componentWillReceiveProps(next) {
    if (next.auth.twitter && !this.props.auth.twitter) {
      const name = next.auth.twitter.userName;
      this.setState({ username: next.auth.twitter.userName });
      this.checkUser(name);
    }
  }

  signUp() {
    if (this.usernameExists) {
      return Alert.alert('This handle is already taken');
    }
    const loginData = this.props.auth.twitter;
    loginData.userName = this.state.username;
    loginData.signup = true;
    loginData.invite = this.props.auth.currentInvite;
    return this.props.actions.twitterAuth(
      loginData,
      this.props.admin ? this.props.admin.currentInvite : null
    );
  }

  checkUser(name) {
    this.nameError = null;
    const toCheck = name || this.state.username;
    if (toCheck) {
      const string = toCheck;
      const match = NAME_PATTERN.test(string);
      if (match) {
        this.props.actions.checkUser(string, 'name')
        .then(results => {
          if (!results) {
            this.usernameExists = true;
            this.nameError = 'This handle is already taken';
          } else this.usernameExists = false;
          this.setState({});
        });
      } else {
        this.nameError =
          'username can only contain letters, numbers, dashes and underscores';
      }
    }
  }

  renderUserName() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.fieldsInputParent}>
          <Text style={styles.smallInfo}>Choose your handle</Text>
          <TextInput
            underlineColorAndroid={'transparent'}
            autoCapitalize={'none'}
            autoCorrect={false}
            keyboardType={'default'}
            clearTextOnFocus={false}
            placeholder="username"
            onChangeText={username => {
              username = username.replace('@', '')
              .trim();
              this.setState({ username });
              this.checkUser(username.trim());
            }}
            value={'@' + this.state.username}
            style={styles.fieldsInput}
          />
        </View>
        {this.nameError ? (
          <Text style={[styles.smallInfo, styles.error]}>{this.nameError}</Text>
        ) : null}
      </View>
    );
  }

  renderCTA() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TwitterButton
          type={'signup'}
          auth={this.props.auth}
          admin={this.props.admin}
          actions={this.props.actions}
        />
        <Text style={styles.signInText}>or</Text>
        <TouchableOpacity
          // style={[styles.largeButton, {flex: 1}]}
          onPress={() => {
            this.props.navigation.navigate({ routeName: 'signup' });
          }}
        >
          <Text style={[styles.signInText, styles.active]}>Sign up with email</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const button = (
      <TouchableOpacity style={[styles.largeButton]} onPress={this.signUp}>
        <Text style={styles.largeButtonText}>Finish</Text>
      </TouchableOpacity>
    );

    if (this.props.auth.loading) {
      return <CustomSpinner />;
    }

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ?
          StatusBar.currentHeight / 2 + 64 :
          (IphoneX ? 88 : 64) }
      >
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'interactive'}
          style={{ flex: 1 }}
          contentContainerStyle={styles.authScrollContent}
        >
          {this.props.auth.twitter ? this.renderUserName() : this.renderCTA()}
          {this.props.auth.twitter ? button : null}

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

TwitterSignup.propTypes = {
  auth: PropTypes.object,
  actions: PropTypes.object,
  admin: PropTypes.object
};

const localStyles = StyleSheet.create({
  forgot: {
    textAlign: 'center',
    marginTop: 5
  },
  error: {
    marginTop: 5,
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };
