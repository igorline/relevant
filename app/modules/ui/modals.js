import React from 'react';
import OnboardingModal from 'modules/ui/web/onboardingModal';
import SettingsModal from 'modules/profile/web/settingsModal.container';
import InviteModal from 'modules/invites/web/inviteModal.container';
import InviteModalTitle from 'modules/invites/inviteModalTitle.component';
import GetTokensModal from 'modules/getTokens/web/getTokensModal.container';
// import AuthContainer from 'modules/auth/web/auth.container';
import CreatePost from 'modules/createPost/createPost.container';
import CommunityMembers from 'modules/community/web/communityMembers.component';
import CommunityMembersTitle from 'modules/community/communityMembersTitle.component';
import ResetPassword from 'modules/auth/web/resetPassword.component';

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

export const communityMembers = {
  title: <CommunityMembersTitle />,
  Body: CommunityMembers,
  footer: () => {}
};

export const resetPassword = {
  title: 'Reset Password',
  Body: ResetPassword,
  footer: () => {}
};

// export const auth = {
//   title: 'Sign In',
//   Body: AuthContainer,
//   footer: () => {}
// };
