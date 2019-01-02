import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import PropTypes from 'prop-types';
import dismissKeyboard from 'react-native-dismiss-keyboard';

import { globalStyles, fullHeight } from 'app/styles/global';

let localStyles;
let styles;

class ResetPassword extends Component {
  static propTypes = {
    actions: PropTypes.object,
    scene: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.validate = this.validate.bind(this);
    this.state = {
      message: '',
      password: null,
      cPassword: null
    };
  }

  componentDidMount() {
    this.token = this.props.scene.route.token;
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  validate() {
    if (this.state.password) {
      if (this.state.password !== this.state.cPassword) {
        Alert.alert("Passwords don't match");
        return;
      }
    } else {
      Alert.alert('Password required');
      return;
    }
    dismissKeyboard();
    this.props.actions.resetPassword(this.state.password, this.token)
    .then(success => {
      if (success) {
        this.props.actions.replaceRoute(
          {
            key: 'login',
            component: 'login',
            title: 'Login',
            showBackButton: true,
            back: true
          },
          1,
          'auth'
        );
      }
    });
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    return (
      <KeyboardAvoidingView behavior={'padding'} style={{ height: fullHeight - 60 }}>
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
                secureTextEntry
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholder="new password"
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

localStyles = StyleSheet.create({
  error: {
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default ResetPassword;
