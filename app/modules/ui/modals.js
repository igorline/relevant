import React from 'react';
import OnboardingModal from 'modules/ui/web/onboardingModal';
import SettingsModal from 'modules/ui/web/settingsModal.container';
import InviteModal from 'modules/ui/web/inviteModal.container';
import InviteModalTitle from 'modules/ui/web/inviteModalTitle.component';

export const onboarding = {
  title: 'Welcome To Relevant',
  Body: OnboardingModal,
  footer: () => {}
};

export const settings = {
  title: 'Settings',
  Body: SettingsModal,
  footer: () => {}
};

export const invite = {
  title: <InviteModalTitle />,
  Body: InviteModal,
  footer: () => {},
  hideX: true
};

// export const getTokens = {
//   title: 'GET TOKENS',
//   Body: GetTokensModal,
//   footer: () => {},
// };
