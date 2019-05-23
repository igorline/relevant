import React from 'react';
import OnboardingModal from 'modules/ui/web/onboardingModal';
import SettingsModal from 'modules/profile/web/settingsModal.container';
import InviteModal from 'modules/invites/web/inviteModal.container';
import InviteModalTitle from 'modules/invites/inviteModalTitle.component';
import GetTokensModal from 'modules/getTokens/web/getTokensModal.container';
import CommunityMembers from 'modules/community/web/communityMembers.component';
import CommunityMembersTitle from 'modules/community/communityMembersTitle.component';
import ResetPassword from 'modules/auth/web/resetPassword.component';
import LoginForm from 'modules/auth/web/login';
import Forgot from 'modules/auth/web/forgot.component';
import SignupSocial from 'modules/auth/web/signupSocial';
import SignupEmail from 'modules/auth/web/signupEmail';
import SetHandle from 'modules/auth/web/handle.component';
import ConfirmEmail from 'modules/auth/web/confirmEmail.component';

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

export const communityMembers = {
  title: <CommunityMembersTitle />,
  Body: CommunityMembers,
  footer: () => {}
};

export const resetPassword = {
  title: 'Reset Password',
  Body: ResetPassword,
  footer: () => {},
  redirect: '/user/login'
};

export const login = {
  title: 'Sign In',
  Body: LoginForm,
  footer: () => {},
  redirect: '/'
};

export const forgot = {
  title: 'Recover Password',
  Body: Forgot,
  footer: () => {},
  redirect: '/user/login'
};

export const signupSocial = {
  title: 'Join the Community',
  Body: SignupSocial,
  footer: () => {},
  redirect: '/'
};

export const signupEmail = {
  title: 'Join the Community',
  Body: SignupEmail,
  footer: () => {},
  redirect: '/'
};

export const setHandle = {
  title: 'Set your Handle',
  Body: SetHandle,
  footer: () => {},
  redirect: '/'
};

export const confirm = {
  title: 'Confirm Your Email',
  Body: ConfirmEmail,
  footer: () => {},
  redirect: '/'
};
