import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  AlertIOS,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles } from '../../styles/global';
import CustomSpinner from '../CustomSpinner.component';

let styles;

class Forgot extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.state = {
      username: null,
      sendingEmail: false
    };
  }

  componentDidMount() {
    this.userInput.focus();
  }

  componentWillUnmount() {
    this.props.actions.setAuthStatusText();
  }

  async forgotPassword() {
    try {
      if (!this.state.username) {
        AlertIOS.alert('must enter a username or password');
        return;
      }

      this.userInput.blur();
      dismissKeyboard();

      this.setState({ sendingEmail: true });

      let res = await this.props.actions.forgotPassword(this.state.username);
      if (res && res.email) {
        this.props.actions.pop('auth');
        this.setState({ sendingEmail: false });
        AlertIOS.alert('Success', `We have set an email to ${res.email}
      with a link to reset the password for ${res.username}.`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  render() {
    let spinner;
    if (this.state.sendingEmail) {
      spinner = <CustomSpinner />;
    }
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0 }
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
                autoCorrect={false}
                autoCapitalize={'none'}
                // keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholder="username or email"
                onChangeText={username => this.setState({ username })}
                value={this.state.username}
                style={styles.fieldsInput}
              />
            </View>
          </View>

          <TouchableHighlight
            onPress={this.forgotPassword}
            underlayColor={'transparent'}
            style={[styles.largeButton]}
          >
            <Text style={styles.largeButtonText}>
              Send Password Reset Link
            </Text>
          </TouchableHighlight>

          {spinner}

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

Forgot.propTypes = {
  actions: React.PropTypes.object,
};

let localStyles = StyleSheet.create({
});
styles = { ...localStyles, ...globalStyles };


export default Forgot;
