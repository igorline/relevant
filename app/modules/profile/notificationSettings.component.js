import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { View, Header, SecondaryText, Title, BodyText } from 'modules/styled/uni';
import { connect } from 'react-redux';
import {
  updateNotificationSettings,
  enableMobileNotifications
} from 'modules/auth/auth.actions';
import { enableDesktopNotifications } from 'modules/activity/activity.actions';
import { bindActionCreators } from 'redux';
import ToggleSwitch from 'modules/ui/toggleswitch.component';
import { colors } from 'app/styles';
import { capitalize } from 'utils/numbers';

const NOTIFICATION_DETAILS = {
  email: {
    personal: {
      label: 'Replies, mentions and earnings',
      description:
        'Get notified when you earn rewards, someone replies to your comments or mentions you in a post.'
    },
    general: {
      label: 'General notifications',
      description:
        'Get notified about new posts and comments on posts you have interacted with.'
    },
    digest: {
      label: 'Email digest',
      description:
        'Receive periodic emails with the top posts from your favorite communities.'
    }
  },
  mobile: {
    all: {
      label: 'Mobile notifications',
      description: 'Receive mobile app notifications for any community activity.'
    }
  },
  desktop: {
    all: {
      label: 'Desktop notifications',
      description: 'Receive notifications in a browser for any community activity.'
    }
  }
};

const NotificationToggle = ({ parent, label, notification, onChange }) => {
  const details = NOTIFICATION_DETAILS[parent][label];
  if (!details) return null;
  return (
    <View fdirection="row" mt={3}>
      <View fdirection="row" align="center" flex={1}>
        <ToggleSwitch
          isOn={!!notification}
          onColor={colors.green}
          offColor={colors.grey}
          size="custom"
          onToggle={isOn => {
            const body = {};
            body[parent] = {};
            body[parent][label] = isOn;
            onChange(body);
          }}
        />
        <View fdirection="column" ml={1.5} shrink={1} wrap>
          {details.label ? <Title>{details.label}</Title> : null}
          {details.description ? <BodyText>{details.description}</BodyText> : null}
        </View>
      </View>
    </View>
  );
};

NotificationToggle.propTypes = {
  parent: PropTypes.string,
  label: PropTypes.string,
  notification: PropTypes.bool,
  onChange: PropTypes.func
};

const NotificationSet = ({ label, notifications, onChange }) => {
  const sortedNotifications = Object.keys(notifications).sort();
  return (
    <View mt={4}>
      <SecondaryText>{capitalize(label)} Notifications</SecondaryText>
      {notifications &&
        sortedNotifications.map(k => (
          <NotificationToggle
            key={k}
            label={k}
            parent={label}
            notification={notifications && notifications[k]}
            onChange={onChange}
          />
        ))}
    </View>
  );
};

NotificationSet.propTypes = {
  label: PropTypes.string,
  notifications: PropTypes.object,
  onChange: PropTypes.func
};

class NotificationSettings extends Component {
  async componentDidUpdate(prevProps) {
    const { actions, user } = this.props;
    const { notificationSettings } = user;
    if (
      !get(prevProps, 'user.notificationSettings.desktop.all') &&
      get(notificationSettings, 'desktop.all')
    ) {
      // TODO fallback for when notifications were previously disabled
      actions.enableDesktopNotifications();
    }

    if (
      !get(prevProps, 'user.notificationSettings.mobile.all') &&
      get(notificationSettings, 'mobile.all')
    ) {
      // TODO fallback for when notifications were previously disabled
      actions.enableMobileNotifications(user);
    }
    return null;
  }

  render() {
    const { user, actions } = this.props;
    if (!user) {
      return null;
    }
    const { notificationSettings } = user;
    if (!notificationSettings) return null;
    const sortedSettings = Object.keys(notificationSettings).sort();
    return (
      <View display="flex" fdirection="column">
        <Header>Notifications</Header>
        {sortedSettings.map(key => (
          <NotificationSet
            key={key}
            label={key}
            notifications={notificationSettings[key]}
            onChange={actions.updateNotificationSettings}
          />
        ))}
      </View>
    );
  }
}

NotificationSettings.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  user: state.auth.user,
  enableReinitialize: true
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      updateNotificationSettings,
      enableDesktopNotifications,
      enableMobileNotifications
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationSettings);
