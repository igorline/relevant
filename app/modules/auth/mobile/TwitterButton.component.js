import React, { Component } from 'react';
import { NativeModules } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { ButtonText, HoverButton, View, BodyText } from 'modules/styled/uni';
import { colors } from 'styles';

require('app/publicenv');

const { RNTwitterSignIn } = NativeModules;

const Constants = {
  TWITTER_COMSUMER_KEY: process.env.TWITTER_COMSUMER_KEY,
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET
};

export default class TwitterButton extends Component {
  static propTypes = {
    type: PropTypes.string,
    actions: PropTypes.object,
    children: PropTypes.node,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false
    };
  }

  async _twitterSignIn() {
    try {
      const { invitecode } = this.props.auth;
      RNTwitterSignIn.init(
        Constants.TWITTER_COMSUMER_KEY,
        Constants.TWITTER_CONSUMER_SECRET
      );
      const loginData = await RNTwitterSignIn.logIn();

      const { authToken, authTokenSecret } = loginData;
      if (!authToken || !authTokenSecret) throw new Error('Twitter login failed');

      // this.props.actions.setTwitter(loginData);
      const serverLogin = await this.props.actions.twitterAuth({
        ...loginData,
        invitecode
      });

      if (serverLogin) {
        setTimeout(() => {
          this.props.actions.reloadTab('discover');
        }, 3000);
      }
    } catch (error) {
      // Alert.alert(error.message);
    }
  }

  render() {
    let text = this.props.type === 'signup' ? 'Sign up' : 'Sign In';
    text += ' with Twitter';
    if (this.props.children) text = this.props.children;
    const isLoggedIn = this.props.auth.twitter;
    let connected;
    if (isLoggedIn && !this.props.type === 'signup') {
      connected = (
        <BodyText alignSelf="center">Twitter connected! Log in to complete.</BodyText>
      );
    }

    return (
      <View style={{ flex: 0, paddingTop: 20, flexDirection: 'row' }}>
        {isLoggedIn ? (
          connected
        ) : (
          <View flex={1}>
            <HoverButton bg={colors.twitterBlue} onPress={() => this._twitterSignIn()}>
              <View fdirection="row" align={'center'}>
                <Icon
                  borderRadius={0}
                  name={'logo-twitter'}
                  size={24}
                  color={'white'}
                  style={{ color: 'white', marginRight: 10 }}
                />
                <ButtonText>{text}</ButtonText>
              </View>
            </HoverButton>
          </View>
        )}
      </View>
    );
  }
}
