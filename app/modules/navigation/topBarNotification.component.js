import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showNotification, hideNotification } from 'modules/activity/activity.actions';
import { colors } from 'app/styles';
import { View } from 'modules/styled/uni';
import DesktopNotification from 'modules/navigation/desktopNotificationPrompt.component';

const NOTIFICATION_TYPES = {
  desktop: DesktopNotification
};

class TopBarNotification extends Component {
  render() {
    const { notif } = this.props;
    if (!notif.notification) {
      return null;
    }
    const Notification = NOTIFICATION_TYPES[notif.notification];
    if (!Notification) {
      return null;
    }
    const { notificationProps } = notif;
    return (
      <View fdirection="column" justify="center" flex={1} bg={colors.green}>
        <View m={['0 4', '0 2']}>
          <Notification {...this.props} {...notificationProps} />
        </View>
      </View>
    );
  }
}

TopBarNotification.propTypes = {
  notif: PropTypes.object,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  notif: state.notif
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      showNotification,
      hideNotification
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBarNotification);
