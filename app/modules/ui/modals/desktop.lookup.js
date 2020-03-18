import React from 'react';
import loadable from '@loadable/component';
import OnboardingModal from 'modules/ui/web/onboardingModal';

const SettingsModal = loadable(() =>
  import('modules/profile/web/settingsModal.container')
);
const InviteModal = loadable(() => import('modules/invites/web/inviteModal.container'));
const InviteModalTitle = loadable(() =>
  import('modules/invites/inviteModalTitle.component')
);
const GetTokensModal = loadable(() =>
  import('modules/getTokens/web/getTokensModal.container')
);
const CommunityMembers = loadable(() =>
  import('modules/community/web/communityMembers.component')
);
const CommunityMembersTitle = loadable(() =>
  import('modules/community/communityMembersTitle.component')
);
const ResetPassword = loadable(() => import('modules/auth/web/resetPassword.component'));
const LoginForm = loadable(() => import('modules/auth/web/login'));
const Forgot = loadable(() => import('modules/auth/web/forgot.component'));
const SignupSocial = loadable(() => import('modules/auth/web/signupSocial'));
const SignupEmail = loadable(() => import('modules/auth/web/profile.form'));
const SetHandle = loadable(() => import('modules/auth/web/handle.component'));
const ConfirmEmail = loadable(() => import('modules/auth/web/confirmEmail.component'));
const BetBody = loadable(() => import('modules/post/bet/bet'));
const CashOutModal = loadable(() => import('modules/wallet/web/cashOutModal'));
const Signup3Box = loadable(() => import('modules/auth/web/signup3Box'));
const LinkMobile = loadable(() => import('modules/profile/web/linkMobile'));

const ConnectMetamaskModal = loadable(() =>
  import('modules/wallet/web/connectMetamaskModal')
);

const CommunitySettings = loadable(() =>
  import('modules/admin/web/communityAdminForm.component')
);
const CreatePost = loadable(() => import('modules/createPost/createPost.container'));
const ModalHeader = loadable(() =>
  import('modules/createPost/web/createPostModal.header')
);

export const linkMobile = {
  Body: LinkMobile,
  maxWidth: [52, 40]
};

export const signup3Box = {
  Body: Signup3Box
};

export const newpost = {
  header: <ModalHeader />,
  Body: CreatePost
};

export const cashOut = {
  Body: CashOutModal
};

export const connectMetamask = {
  Body: ConnectMetamaskModal
};

export const investModal = {
  Body: BetBody,
  maxWidth: [52, 40]
};

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

export const communitySettings = {
  title: 'Community Settings',
  Body: CommunitySettings
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
  redirect: '/user/login'
};

export const login = {
  title: 'Sign In',
  Body: LoginForm,
  footer: () => {}
};

export const forgot = {
  title: 'Recover Password',
  Body: Forgot,
  redirect: '/user/login'
};

export const signupSocial = {
  title: 'Join the Community',
  Body: SignupSocial
};

export const signupEmail = {
  title: 'Join the Community',
  Body: SignupEmail
};

export const setHandle = {
  title: 'Set your Handle',
  Body: SetHandle
};

export const confirm = {
  title: 'Confirm Your Email',
  Body: ConfirmEmail
};
