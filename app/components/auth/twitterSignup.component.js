import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import { globalStyles } from '../../styles/global';
import TwitterButton from './TwitterButton.component';

let styles;

export default class TwitterSignup extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    codePush.disallowRestart();
  }

  render() {
    return (
      <View style={[{ flex: 1 }, styles.fieldsParent]}>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

          <TwitterButton
            type={'signup'}
            auth={this.props.auth}
            actions={this.props.actions}
          />
          <Text>or</Text>
          <TouchableOpacity
            // style={[styles.largeButton, {flex: 1}]}
            onPress={() => {
              this.props.actions.push({
                key: 'signup',
                title: 'image',
                component: 'image',
                back: true
              }, 'auth');
            }}
          >
            <Text style={[styles.signInText, styles.active]}>Sign up with email</Text>
          </TouchableOpacity>

        </View>
        <Text
          style={[
            styles.signInText,
            styles.font12,
          ]}
        >
          By signing up, you agree to our{' '}
          <Text
            style={[styles.signInText, styles.active, styles.font12]}
            onPress={() =>
              this.props.actions.goToUrl('https://relevant.community/eula.html')
            }
          >
            Terms of Use
          </Text>
        </Text>
      </View>
    );
  }
}

TwitterSignup.propTypes = {
  auth: PropTypes.object,
  actions: PropTypes.object,
};

let localStyles = StyleSheet.create({
  forgot: {
    textAlign: 'center',
    marginTop: 5
  }
});

styles = { ...globalStyles, ...localStyles };

