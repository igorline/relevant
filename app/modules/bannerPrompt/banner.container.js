import React from 'react';
import { useSelector } from 'react-redux';
import { colors } from 'app/styles';
import { View } from 'modules/styled/uni';
import PushNotification from './notificationBanner';
import BetNotification from './betBanner';

const PROMPT_TYPES = {
  push: PushNotification,
  bet: BetNotification
};

export default function BannerPrompt() {
  const notif = useSelector(state => state.notif);
  if (!notif.promptType) return null;

  const Prompt = PROMPT_TYPES[notif.promptType];
  if (!Prompt) return null;

  const { promptProps } = notif;

  return (
    <View
      fdirectio={'column'}
      justify={'center'}
      flex={1}
      bg={colors.green}
      p={['0 4', '0 2']}
    >
      <Prompt {...promptProps} />
    </View>
  );
}
