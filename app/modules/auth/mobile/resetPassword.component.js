import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { colors } from 'styles';

import { globalStyles, IphoneX } from 'app/styles/global';

let styles;

class ResetPassword extends Component {
  static propTypes = {
    actions: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.validate = this.validate.bind(this);
    this.state = {
      message: '',
      password: null,
      cPassword: null
    };
  }

  componentDidMount() {
    const { index, routes } = this.props.navigation.state;
    this.token = get(routes[index], 'params.token');
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
    this.props.actions
      .resetPassword(this.state.password, this.token)
      .then(success => {
        if (success) {
          this.props.navigation.replace('login');
        }
      })
      .catch(Alert.alert);
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={
          Platform.OS === 'android' ? StatusBar.currentHeight / 2 + 64 : IphoneX ? 88 : 64
        }
      >
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          scrollEnabled={false}
          keyboardDismissMode={'interactive'}
          contentContainerStyle={styles.fieldsParent}
        >
          <View style={styles.fieldsInner}>
            <View style={styles.fieldsInputParent}>
              <TextInput
                autoCapitalize={'none'}
                secureTextEntry
                keyboardType={'default'}
                clearTextOnFocus={false}
                placeholderTextColor={colors.grey}
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
                placeholderTextColor={colors.grey}
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

const localStyles = StyleSheet.create({
  error: {
    color: 'red',
    textAlign: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default ResetPassword;
