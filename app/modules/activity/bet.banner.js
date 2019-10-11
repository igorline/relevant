import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { storage } from 'utils';
import { hideBannerPrompt } from 'modules/activity/activity.actions';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
import MobileAlert from './mobile.banner';
import Banner from './banner.component';

const TEXT = {
  messageText:
    'When you upvote a post you are automatically betting some coins on it. To customize bet amounts, ',
  actionText: 'enable manual betting.',
  dismissText: 'Dismiss'
};

PushNotification.propTypes = {
  isMobile: PropTypes.bool
};

function PushNotification({ isMobile }) {
  const { messageText, actionText, dismissText } = TEXT;
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(updateNotificationSettings({ bet: { manual: true } }));
    dispatch(hideBannerPrompt());
  };
  const handleDismiss = () => {
    dispatch(hideBannerPrompt());
    const now = new Date().getTime();
    storage.set('pushDismissed', now);
  };

  if (isMobile) {
    MobileAlert({
      title: 'Stay up to date',
      messageText,
      actionText,
      dismissText,
      onDismiss: handleDismiss,
      onClick
    });
    dispatch(hideBannerPrompt());
    return null;
  }

  return (
    <Banner
      onClick={onClick}
      onDismiss={handleDismiss}
      messageText={messageText}
      dismissText={dismissText}
      actionText={actionText}
    />
  );
}

export default PushNotification;
