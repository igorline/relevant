import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles, IphoneX } from 'app/styles/global';
import { colors } from 'styles';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import TwitterButton from './TwitterButton.component';
import { ConnectDesktopButton } from '../socialButtons';

let styles;

class Login extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    navigation: PropTypes.object,
    share: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.login = this.login.bind(this);
    this.state = {
      bool: false,
      notifText: null,
      username: null,
      password: null
    };
  }

  componentDidMount() {
    // this.userInput.focus();
    codePush.disallowRestart();
  }

  componentWillUnmount() {
    this.props.actions.setAuthStatusText();
  }

  login() {
    if (!this.state.username) {
      Alert.alert('must enter username');
      return;
    }

    if (!this.state.password) {
      Alert.alert('must enter password');
      return;
    }
    dismissKeyboard();
    this.props.actions.loginUser({
      name: this.state.username,
      password: this.state.password,
      twitter: this.props.auth.twitter
    });
  }

  render() {
    const { actions } = this.props;

    let KBView = KeyboardAvoidingView;
    if (this.props.share) {
      KBView = View;
    }

    let local =
      this.state.username &&
      this.state.password &&
      this.state.username.length &&
      this.state.password.length;

    if (this.props.auth.twitter) local = true;

    const twitterConnect = (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.signInText}>
          Sign in with your Relevant account to finish
        </Text>
      </View>
    );

    const signIn = (
      <TouchableOpacity onPress={this.login} style={[styles.largeButton]}>
        <Text style={styles.largeButtonText}>sign in</Text>
      </TouchableOpacity>
    );

    if (this.props.auth.loading) {
      return <CustomSpinner />;
    }

    return (
      <KBView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={
          Platform.OS === 'android' ? StatusBar.currentHeight / 2 + 64 : IphoneX ? 88 : 64
        }
      >
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'interactive'}
          contentContainerStyle={styles.authScrollContent}
        >
          <View style={styles.fieldsInner}>
            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => (this.userInput = c)}
                underlineColorAndroid={'transparent'}
                autoCorrect={false}
                autoCapitalize={'none'}
                clearTextOnFocus={false}
                placeholderTextColor={colors.grey}
                placeholder="username or email"
                onChangeText={username => this.setState({ username: username.trim() })}
                value={this.state.username}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => (this.passInput = c)}
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                secureTextEntry
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholderTextColor={colors.grey}
                placeholder="password"
                onChangeText={password => this.setState({ password: password.trim() })}
                value={this.state.password}
                style={styles.fieldsInput}
              />
            </View>
            {local ? null : (
              <View>
                <Text style={styles.signInText}>or</Text>
                <TwitterButton auth={this.props.auth} actions={this.props.actions} />
              </View>
            )}
            {!local && (
              <View style={{ marginTop: 18 }}>
                <ConnectDesktopButton
                  text={'Sign in with Desktop Browser'}
                  onPress={() => actions.showModal('connectDesktop')}
                />
              </View>
            )}
            <View style={{ flex: 1 }} />
            {this.props.auth.twitter ? twitterConnect : null}
          </View>

          {local ? signIn : null}

          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate({
                routeName: 'forgot',
                params: { title: 'Forgot Password' }
              });
            }}
          >
            <Text style={[styles.signInText, styles.active]}>Forgot your password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KBView>
    );
  }
}

Login.propTypes = {
  auth: PropTypes.object,
  actions: PropTypes.object,
  navigation: PropTypes.object,
  share: PropTypes.bool // flag for share extension
};

const localStyles = StyleSheet.create({
  forgot: {
    textAlign: 'center',
    marginTop: 5
  }
});
styles = { ...localStyles, ...globalStyles };

export default Login;
