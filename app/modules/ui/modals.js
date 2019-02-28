import React from 'react';
import OnboardingModal from 'modules/ui/web/onboardingModal';
import SettingsModal from 'modules/ui/web/settingsModal.container';
import InviteModal from 'modules/ui/web/inviteModal.container';
import InviteModalTitle from 'modules/ui/web/inviteModalTitle.component';
import GetTokensModal from 'modules/ui/web/getTokensModal.container';
// import AuthContainer from 'modules/auth/web/auth.container';

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
  footer: () => {}
};

export const getTokens = {
  title: 'Get Tokens',
  Body: GetTokensModal,
  footer: () => {}
};

// export const auth = {
//   title: 'Sign In',
//   Body: AuthContainer,
//   footer: () => {}
// };
