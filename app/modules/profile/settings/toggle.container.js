import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { View, Header, SecondaryText } from 'modules/styled/uni';
import { connect } from 'react-redux';
import { enableMobileNotifications } from 'modules/auth/auth.actions';
import { enableDesktopNotifications } from 'modules/activity/activity.actions';
import { bindActionCreators } from 'redux';
import { SECTIONS } from './settings.constants';
import { NotificationToggle } from './settings.toggle';

class NotificationSettings extends Component {
  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.object
  };

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
    const { user } = this.props;
    if (!user) return null;
    const { notificationSettings } = user;
    if (!notificationSettings) return null;
    return (
      <Fragment>
        {SECTIONS.map(section => (
          <View key={section.label} mb={4} display="flex" fdirection="column">
            <Header>{section.label}</Header>
            {section.settings.map(el => (
              <NotificationSet
                key={el.field}
                field={el.field}
                label={el.label}
                notifications={notificationSettings[el.field]}
              />
            ))}
          </View>
        ))}
      </Fragment>
    );
  }
}

NotificationSet.propTypes = {
  label: PropTypes.string,
  notifications: PropTypes.object,
  field: PropTypes.string
};

function NotificationSet({ label, notifications, field }) {
  if (!notifications) return null;
  const sortedNotifications = Object.keys(notifications).sort();
  return (
    <View>
      {label && <SecondaryText mt={4}>{label}</SecondaryText>}
      {notifications &&
        sortedNotifications.map(k => (
          <NotificationToggle
            key={k}
            label={k}
            parent={field}
            notification={notifications && notifications[k]}
          />
        ))}
    </View>
  );
}

const mapStateToProps = state => ({
  user: state.auth.user,
  enableReinitialize: true
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
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
