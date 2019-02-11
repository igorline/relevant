import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  SecondaryText,
  Button,
  Image,
  View,
  LinkFont,
  Touchable
} from 'modules/styled/uni';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';

const twitterIcon = '/img/icons/twitter_white.png';

class SignupTwitter extends Component {
  static propTypes = {
    authNav: PropTypes.func,
    setProvider: PropTypes.func.isRequired
  };

  render() {
    const { setProvider } = this.props;
    return (
      <View display="flex" fdirection="column" align-items="flex-start">
        <SecondaryText>
          Sign up to Relevant with your Twitter account or your Email.
        </SecondaryText>
        <View display="flex" fdirection="row" align="center" mt={7}>
          <ULink to="/auth/twitter" external mr={4}>
            <Button bg={colors.twitterBlue}>
              <Image source={twitterIcon} w={2} h={2} mr={2} />
              Sign up with Twitter
            </Button>
          </ULink>
          <Touchable
            onPress={e => {
              e.preventDefault();
              setProvider('email').bind(this);
            }}
          >
            <LinkFont c={colors.blue}>Sign up with Email</LinkFont>
          </Touchable>
        </View>
        <LinkFont mt={4}>
          Already registered?{' '}
          <ULink onClick={() => this.props.authNav('login')} to="#" c={colors.blue}>
            Sign In
          </ULink>
        </LinkFont>
      </View>
    );
  }
}

export default SignupTwitter;
