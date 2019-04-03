import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Header, Title, Button, Text } from 'modules/styled/uni';
import { connect } from 'react-redux';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
import { bindActionCreators } from 'redux';
import ToggleSwitch from 'modules/ui/toggleswitch.component';
import { colors } from 'app/styles';

const NotificationToggle = ({ parent, label, notification, onChange }) => (
  <View fdirection="row">
    <Text m={0} p={0} lh={1}>
      <ToggleSwitch
        isOn={!!notification}
        onColor={colors.green}
        offColor={colors.red}
        label={label}
        size="small"
        onToggle={isOn => {
          const body = {};
          body[parent] = {};
          body[parent][label] = isOn;
          onChange(body);
        }}
      />
    </Text>
  </View>
);

NotificationToggle.propTypes = {
  parent: PropTypes.string,
  label: PropTypes.string,
  notification: PropTypes.bool,
  onChange: PropTypes.func
};

const NotificationSet = ({ label, notifications, onChange }) => {
  const sortedNotifications = Object.keys(notifications).sort();
  return (
    <View>
      <Title>{label}</Title>
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
        <Button
          onClick={() =>
            actions.updateNotificationSettings({
              email: {
                all: true,
                digest: true,
                replies: true
              },
              mobile: {
                all: true
              },
              desktop: {
                all: true
              }
            })
          }
        >
          Reset Notifications
        </Button>
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
