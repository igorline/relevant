import React from 'react';
import { useDispatch } from 'react-redux';
import { storage } from 'utils';
import { hideBannerPrompt } from 'modules/activity/activity.actions';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
import { isNative } from 'styles';
import MobileAlert from './banner.mobile';
import Banner from './banner.desktop';

export const TEXT = {
  mobileText:
    'When you upvote a post you are automatically betting some coins on it. You can customize bet amounts if you enable manual betting.',
  messageText:
    'When you upvote a post you are automatically betting some coins on it. To customize bet amounts, ',
  actionText: 'enable manual betting.',
  dismissText: 'Dismiss'
};

function PushNotification() {
  const { messageText, actionText, dismissText, mobileText } = TEXT;
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(updateNotificationSettings({ bet: { manual: true } }));
    dispatch(hideBannerPrompt());
  };

  const handleDismiss = () => {
    dispatch(hideBannerPrompt());
    const now = new Date().getTime();
    storage.set('betDismissed', now);
  };

  if (isNative) {
    MobileAlert({
      title: 'Enable manual betting?',
      messageText: mobileText,
      // actionText: 'Enable',
      // dismissText,
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
