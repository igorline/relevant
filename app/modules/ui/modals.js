import React from 'react';
import OnboardingModal from 'modules/ui/web/onboardingModal';
import SettingsModal from 'modules/ui/web/settingsModal.container';
import InviteModal from 'modules/invites/web/inviteModal.container';
import InviteModalTitle from 'modules/invites/inviteModalTitle.component';
import GetTokensModal from 'modules/getTokens/web/getTokensModal.container';
// import AuthContainer from 'modules/auth/web/auth.container';
import CreatePost from 'modules/createPost/createPost.container';

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

export const newpost = {
  title: 'New Post',
  Body: CreatePost,
  bodyProps: {
    modal: true
  },
  footer: () => {}
};

// export const auth = {
//   title: 'Sign In',
//   Body: AuthContainer,
//   footer: () => {}
// };