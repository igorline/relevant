import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  showBannerPrompt,
  hideBannerPrompt,
  enableDesktopNotifications
} from 'modules/activity/activity.actions';
import { colors } from 'app/styles';
import { enableMobileNotifications } from 'modules/auth/auth.actions';
import { View } from 'modules/styled/uni';
import PushNotification from 'modules/activity/pushNotificationPrompt.component';

const PROMPT_TYPES = {
  push: PushNotification
};

class BannerPrompt extends Component {
  render() {
    const { notif } = this.props;
    if (!notif.promptType) {
      return null;
    }
    const Notification = PROMPT_TYPES[notif.promptType];
    if (!Notification) {
      return null;
    }
    const { promptProps } = notif;
    let viewProps = {};
    if (process.env.WEB === 'true') {
      viewProps = {
        fdirection: 'column',
        justify: 'center',
        flex: 1,
        bg: colors.green,
        p: ['0 4', '0 2']
      };
    }
    return (
      <View {...viewProps}>
        <Notification {...this.props} {...promptProps} />
      </View>
    );
  }
}

BannerPrompt.propTypes = {
  notif: PropTypes.object,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  notif: state.notif,
  user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      showBannerPrompt,
      hideBannerPrompt,
      enableMobileNotifications,
      enableDesktopNotifications
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BannerPrompt);
