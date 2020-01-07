import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { sendConfirmation } from 'modules/auth/auth.actions';
import { showModal } from 'modules/navigation/navigation.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GetTokensModal from 'modules/getTokens/getTokensModal.component';
import { colors } from 'app/styles';
import { Image, HoverButton, LinkFont } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

const twitterIcon = require('app/public/img/icons/twitter_white.png');
const redditIcon = require('app/public/img/icons/reddit.png');

const TwitterButton = () => (
  <ULink to="/auth/twitter" external mr={['auto', 0]} mt={3}>
    <HoverButton
      w={[22, 'auto']}
      bg={colors.twitterBlue}
      m={0}
      c={colors.white}
      fdirection="row"
    >
      <Image resizeMode="contain" source={twitterIcon} w={3} h={3} mr={1.5} />
      <LinkFont c={colors.white}>Connect Twitter</LinkFont>
    </HoverButton>
  </ULink>
);

const RedditButton = () => (
  <ULink to="/auth/reddit" external mr={['auto', 0]} mt={3}>
    <HoverButton
      w={[22, 'auto']}
      bg={colors.redditColor}
      m={0}
      c={colors.white}
      fdirection="row"
    >
      <Image resizeMode="contain" source={redditIcon} w={3} h={3} mr={1.5} />
      <LinkFont c={colors.white}>Connect Reddit</LinkFont>
    </HoverButton>
  </ULink>
);

class GetTokensModalContainer extends Component {
  render() {
    return (
      <GetTokensModal
        {...this.props}
        twitterButton={<TwitterButton />}
        redditButton={<RedditButton />}
      />
    );
  }
}

GetTokensModalContainer.propTypes = {
  actions: PropTypes.object,
  close: PropTypes.func,
  auth: PropTypes.object
};

const mapStateToProps = state => ({
  auth: get(state, 'auth', {}) || {}
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      // createInvite,
      // getInviteCount
      sendConfirmation,
      showModal
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GetTokensModalContainer);
