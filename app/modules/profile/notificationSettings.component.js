import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Header, SecondaryText, Title, BodyText } from 'modules/styled/uni';
import { connect } from 'react-redux';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
import { bindActionCreators } from 'redux';
import ToggleSwitch from 'modules/ui/toggleswitch.component';
import { colors } from 'app/styles';
import { capitalize } from 'utils/numbers';

const NOTIFICATION_DETAILS = {
  email: {
    all: {
      label: 'Email notifications',
      description: 'If turned off, you will still receive administrative emails'
    },
    digest: {
      label: 'Email digests',
      description:
        'Receive periodic emails with the top posts from your favorite communities'
    },
    replies: {
      label: 'Reply and mentions',
      description:
        'Get notified when someone replies to your comments or mentions you in a comment'
    }
  },
  mobile: {
    all: {
      label: 'Mobile notifications',
      description: 'Receive mobile app notifications for any community activity'
    }
  },
  desktop: {
    all: {
      label: 'Desktop notifications',
      description: 'Receive notifications in a browser for any community activity'
    }
  }
};

const NotificationToggle = ({ parent, label, notification, onChange }) => {
  const details = NOTIFICATION_DETAILS[parent][label];
  return (
    <View fdirection="row" mt={3}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
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
        <View fdirection="column" ml={1.5}>
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
  render() {
    const { user, actions } = this.props;
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
      updateNotificationSettings
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationSettings);
