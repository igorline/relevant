
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles, blue } from '../../styles/global';

require('../../publicenv');

const { RNTwitterSignIn } = NativeModules;
let styles;

const Constants = {
  //Dev Parse keys
  TWITTER_COMSUMER_KEY: process.env.TWITTER_COMSUMER_KEY,
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
};

export default class TwitterButton extends Component {
  constructor(props) {
    super(props);
  }

  _twitterSignIn() {
    RNTwitterSignIn.init(Constants.TWITTER_COMSUMER_KEY, Constants.TWITTER_CONSUMER_SECRET);
    RNTwitterSignIn.logIn()
    .then(loginData => {
      const { authToken, authTokenSecret } = loginData;
      if (authToken && authTokenSecret) {
        this.props.actions.twitterAuth(loginData);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    let text = this.props.type === 'signup' ? 'Sign up' : 'Sign In';
    text += ' with Twitter';
    const isLoggedIn = this.props.auth.twitter;
    return (
      <View style={{ flex: 0, paddingVertical: 20, flexDirection: 'row' }}>
        {
          isLoggedIn
          ?
          (<Text style={[{ alignSelf: 'center' }, styles.signInText]}>
            Twitter connected! Log in to complete.
          </Text>)
          :
          <TouchableOpacity
            style={[styles.twitterButton, { flexDirection: 'row' }]}
            onPress={this._twitterSignIn.bind(this)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                borderRadius={0}
                name={'logo-twitter'}
                size={30} color={'white'}
                style={styles.icon}
              />
              <Text style={styles.twitterText}>{text}</Text>
            </View>
          </TouchableOpacity>
        }
      </View>
    );
  }
};

const local = StyleSheet.create({
  twitterText: {
    color: 'white',
    fontFamily: 'Arial',
    alignSelf: 'center',
    textAlign: 'center',
    flex: 1,
    backgroundColor: 'transparent',
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
    // width: 50,
    // height: 50,
    color: 'white',
    alignSelf: 'center',
    marginRight: 20,
    backgroundColor: 'transparent',
  }
});

styles = { ...globalStyles, ...local };
