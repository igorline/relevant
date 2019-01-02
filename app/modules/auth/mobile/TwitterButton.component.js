import React, { Component } from 'react';
import { StyleSheet, Text, View, NativeModules, TouchableOpacity, Alert } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from 'app/styles/global';

require('app/publicenv');

const { RNTwitterSignIn } = NativeModules;
let styles;

const Constants = {
  TWITTER_COMSUMER_KEY: process.env.TWITTER_COMSUMER_KEY,
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET
};

export default class TwitterButton extends Component {
  static propTypes = {
    type: PropTypes.string,
    actions: PropTypes.object,
    admin: PropTypes.object,
    children: PropTypes.node,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false
    };
  }

  _twitterSignIn() {
    RNTwitterSignIn.init(Constants.TWITTER_COMSUMER_KEY, Constants.TWITTER_CONSUMER_SECRET);
    RNTwitterSignIn.logIn()
    .then(loginData => {
      const { authToken, authTokenSecret } = loginData;
      if (authToken && authTokenSecret) {
        if (this.props.type === 'signup') {
          loginData.singup = true;
        }
        this.props.actions.setTwitter(loginData);
        return this.props.actions
        .twitterAuth(loginData, this.props.admin ? this.props.admin.currentInvite : null)
        .then(() => {
          setTimeout(() => {
            this.props.actions.reloadTab('discover');
          }, 3000);
        })
        .catch(err => Alert.alert(err));
      }
      return null;
    })
    .catch(error => {
      Alert.alert(error);
    });
  }

  render() {
    let text = this.props.type === 'signup' ? 'Sign up' : 'Sign In';
    text += ' with Twitter';
    if (this.props.children) text = this.props.children;
    const isLoggedIn = this.props.auth.twitter;
    let connected;
    if (isLoggedIn && !this.props.type === 'signup') {
      connected = (
        <Text style={[{ alignSelf: 'center' }, styles.signInText]}>
          Twitter connected! Log in to complete.
        </Text>
      );
    }

    return (
      <View style={{ flex: 0, paddingTop: 20, flexDirection: 'row' }}>
        {isLoggedIn ? (
          connected
        ) : (
          <TouchableOpacity
            style={[styles.twitterButton, { flexDirection: 'row' }]}
            onPress={() => this._twitterSignIn()}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                borderRadius={0}
                name={'logo-twitter'}
                size={30}
                color={'white'}
                style={styles.icon}
              />
              <Text style={styles.twitterText}>{text}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const local = StyleSheet.create({
  twitterText: {
    color: 'white',
    fontFamily: 'Arial',
    alignSelf: 'center',
    textAlign: 'center',
    flex: 1,
    backgroundColor: 'transparent'
  },
  twitterButton: {
    backgroundColor: '#00aced',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15
  },
  icon: {
    position: 'absolute',
    left: 5,
    color: 'white',
    alignSelf: 'center',
    marginRight: 20,
    backgroundColor: 'transparent'
  }
});

styles = { ...globalStyles, ...local };
