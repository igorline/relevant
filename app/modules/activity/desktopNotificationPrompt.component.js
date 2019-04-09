import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { View, BodyText, CTALink } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

class DesktopNotification extends Component {
  handleClick = () => {
    const { actions } = this.props;
    Notification.requestPermission().then(() => {
      actions.hideBannerPrompt();
    });
  };

  handleDismiss = () => {
    const { actions } = this.props;
    actions.hideBannerPrompt();
    const now = new Date().getTime();
    localStorage.setItem('desktopDismissed', now);
  };

  render() {
    const { messageText, actionText, dismissText } = this.props;
    return (
      <View fdirection="row" justify="space-between">
        <BodyText c={colors.white} inline={1}>
          {messageText || 'Enable desktop notifications'}
          {'  '}
          <ULink to="#">
            <CTALink inline={1} onClick={this.handleClick}>
              {actionText || 'click here'}
            </CTALink>
          </ULink>
        </BodyText>
        <ULink onClick={this.handleDismiss} to="#" c={colors.white}>
          {dismissText || 'Dismiss'}
        </ULink>
      </View>
    );
  }
}

DesktopNotification.propTypes = {
  actions: PropTypes.object,
  messageText: PropTypes.string,
  actionText: PropTypes.string,
  dismissText: PropTypes.string
};

export default DesktopNotification;
