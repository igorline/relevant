import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { Alert } from 'app/utils/alert';
import { View, BodyText, CTALink } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { storage } from 'utils';

const TEXT_DEFAULTS = {
  messageText: 'Enable notifications and get alerted when people respond',
  actionText: 'Click here',
  dismissText: 'Dismiss'
};

const MESSAGE_TEXT_DEFAULTS = {
  upvoteComment: 'Get notified when someone comments on this thread.',
  upvotePost: 'Get notified when you earn rewards for upvoting posts.',
  createComment: 'Get notified when someone replies to your comment.',
  createPost: 'Get notified when someone replies to your post.'
};

class PushNotification extends Component {
  handleClick = () => {
    const { actions } = this.props;
    Notification.requestPermission().then(() => {
      actions.hideBannerPrompt();
    });
  };

  handleClickMobile = () => {
    const { actions, user } = this.props;
    actions.addDeviceToken(user);
  };

  handleDismiss = () => {
    const { actions } = this.props;
    actions.hideBannerPrompt();
    this.dismiss();
  };

  dismiss = () => {
    const now = new Date().getTime();
    storage.set('pushDismissed', now);
  };

  render() {
    const { type, messageText, actionText, dismissText, isMobile, actions } = this.props;
    if (isMobile) {
      Alert(true).alert(
        'Stay up to date',
        messageText || MESSAGE_TEXT_DEFAULTS[type],
        [
          {
            text: actionText || 'Ok',
            onPress: this.handleClickMobile
          },
          {
            text: dismissText || 'Not now',
            onPress: this.dismiss,
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
      actions.hideBannerPrompt();
      return null;
    }
    return (
      <View fdirection="row" justify="space-between" align="center">
        <BodyText c={colors.white} inline={1}>
          {messageText || MESSAGE_TEXT_DEFAULTS[type] || TEXT_DEFAULTS.messageText}
          {'  '}
          <ULink to="#">
            <CTALink inline={1} onClick={this.handleClick}>
              {actionText || TEXT_DEFAULTS.actionText}
            </CTALink>
          </ULink>
        </BodyText>
        <ULink onClick={this.handleDismiss} to="#" c={colors.white}>
          {dismissText || TEXT_DEFAULTS.dismissText}
        </ULink>
      </View>
    );
  }
}

PushNotification.propTypes = {
  actions: PropTypes.object,
  messageText: PropTypes.string,
  actionText: PropTypes.string,
  dismissText: PropTypes.string,
  isMobile: PropTypes.bool,
  user: PropTypes.object,
  type: PropTypes.string
};

export default PushNotification;
