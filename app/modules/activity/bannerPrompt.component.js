import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showBannerPrompt, hideBannerPrompt } from 'modules/activity/activity.actions';
import { colors } from 'app/styles';
import { View } from 'modules/styled/uni';
import DesktopNotification from 'modules/activity/desktopNotificationPrompt.component';

const PROMPT_TYPES = {
  desktop: DesktopNotification
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
    return (
      <View fdirection="column" justify="center" flex={1} bg={colors.green}>
        <View m={['0 4', '0 2']}>
          <Notification {...this.props} {...promptProps} />
        </View>
      </View>
    );
  }
}

BannerPrompt.propTypes = {
  notif: PropTypes.object,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  notif: state.notif
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      showBannerPrompt,
      hideBannerPrompt
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BannerPrompt);
