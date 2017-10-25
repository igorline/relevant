import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles } from '../../styles/global';
import TwitterButton from './TwitterButton.component';

let localStyles;
let styles;

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      bool: false,
      notifText: null,
      username: null,
      password: null,
    };
  }

  componentDidMount() {
    this.userInput.focus();
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
    this.props.actions.loginUser({ name: this.state.username, password: this.state.password });
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    let KBView = KeyboardAvoidingView;
    if (this.props.share) {
      KBView = View;
    }

    return (
      <KBView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
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
                ref={c => this.userInput = c}
                underlineColorAndroid={'transparent'}
                autoCorrect={false}
                autoCapitalize={'none'}
                // keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholder="username"
                onChangeText={username => this.setState({ username: username.trim() })}
                value={this.state.username}
                style={styles.fieldsInput}
              />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => this.passInput = c}
                underlineColorAndroid={'transparent'}
                autoCapitalize={'none'}
                autoCorrect={false}
                secureTextEntry
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="password"
                onChangeText={password => this.setState({ password: password.trim() })}
                value={this.state.password}
                style={styles.fieldsInput}
              />
            </View>

            <TwitterButton actions={this.props.actions} />

          </View>

          <TouchableHighlight
            onPress={this.login}
            underlayColor={'transparent'}
            style={[styles.largeButton]}
          >
            <Text style={styles.largeButtonText}>
              sign in
            </Text>
          </TouchableHighlight>
          <Text
            onPress={() => {
              this.props.actions.push({
                key: 'forgot',
                title: 'Forgot Pass',
                back: true
              }, 'auth');
            }}
            style={[styles.signInText, styles.active]}
          >
            Forgot you password?
          </Text>
        </ScrollView>
      </KBView>
    );
  }
}

Login.propTypes = {
  actions: React.PropTypes.object,
};

localStyles = StyleSheet.create({
  forgot: {
    textAlign: 'center',
    marginTop: 5
  }
});


export default Login;
