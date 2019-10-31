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
  Platform,
  StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { globalStyles, IphoneX } from 'app/styles/global';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import { colors } from 'styles';

let styles;

class Forgot extends Component {
  static propTypes = {
    actions: PropTypes.object,
    navigation: PropTypes.object,
    share: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
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
        Alert.alert('must enter a username or password');
        return;
      }

      this.userInput.blur();
      dismissKeyboard();

      this.setState({ sendingEmail: true });

      const res = await this.props.actions.forgotPassword(this.state.username);
      if (res && res.email) {
        this.props.navigation.navigate('mainAuth');
        this.setState({ sendingEmail: false });
        Alert.alert(
          `We have set an email to ${res.email}
      with a link to reset the password for ${res.username}.`,
          "If you don't see a password reset email in your inbox, please check your spam folder."
        );
      }
    } catch (err) {
      Alert.alert(err);
    }
  }

  render() {
    let spinner;
    if (this.state.sendingEmail) {
      spinner = <CustomSpinner />;
    }

    let KBView = KeyboardAvoidingView;
    if (this.props.share) {
      KBView = View;
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
          scrollEnabled={false}
          contentContainerStyle={styles.fieldsParent}
        >
          <View style={styles.fieldsInner}>
            <View style={styles.fieldsInputParent}>
              <TextInput
                ref={c => (this.userInput = c)}
                underlineColorAndroid={'transparent'}
                autoCorrect={false}
                autoCapitalize={'none'}
                // keyboardType={'email-address'}
                clearTextOnFocus={false}
                placeholderTextColor={colors.grey}
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
            <Text style={styles.largeButtonText}>Send Password Reset Link</Text>
          </TouchableHighlight>

          {spinner}
        </ScrollView>
      </KBView>
    );
  }
}

Forgot.propTypes = {
  actions: PropTypes.object
};

const localStyles = StyleSheet.create({});
styles = { ...localStyles, ...globalStyles };

export default Forgot;
