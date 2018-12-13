// import React from 'react';
import { routerActions } from 'react-router-redux';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history3/redirect';

import App from './components/app';
import SplashContainer from './components/splash/splash.container';
import DiscoverContainer from './components/discover/discover.container';
import Auth from './components/auth/auth.container';
import ProfileContainer from './components/profile/profile.container';
import PostContainer from './components/post/post.container';
import CreatePostContainer from './components/createPost/createPost.container';
import NotFound from './components/404';
import TopicsAdmin from './components/admin/topics.container';
import Invites from './components/admin/invites.container';
import Invite from './components/admin/invite.component';
import Faq from './components/admin/faq.component';
import AdminHeader from './components/admin/header.component';
import Flagged from './components/admin/flagged.component';
import Waitlist from './components/admin/waitlist.component';
import Downvotes from './components/admin/downvotes.container';
import Email from './components/admin/email.component';
import TopPosts from './components/admin/topPosts.component';
import Wallet from './components/wallet/wallet.container';
import AdminWallet from './components/admin/admin.main.component';
import CommuntiyAdmin from './components/admin/communityAdmin.component';

// Redirects to /login by default
const userIsAuthenticated = connectedRouterRedirect({
  redirectPath: '/login',
  authenticatedSelector: state => state.auth.user !== null,
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated'
});

// community slug blacklist
// user
// admin
// info
// api
// img
// fonts
// files
// home

const userIsAdmin = connectedRouterRedirect({
  redirectPath: '/login',
  allowRedirectBack: false,
  authenticatedSelector: state => state.auth.user && state.auth.user.role === 'admin',
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAdmin'
});

const routes = () =>
  // const connect = (fn) => (nextState, replaceState) => fn(store, nextState, replaceState);

  ({
    path: '/',
    component: App,
    indexRoute: { component: SplashContainer },
    childRoutes: [
      {
        path: 'user',
        childRoutes: [
          { path: 'login', component: Auth },
          { path: 'signup', component: Auth },
          { path: 'wallet', component: Wallet },
          { path: 'profile/:id', component: ProfileContainer },
          { path: 'forgot', component: Auth },
          // WARNING THESE ROUTE MUST MACH MOBILE APP!
          { path: 'resetPassword/:token', component: Auth },
          { path: 'confirm/:user/:code', component: Auth },
          { path: 'invite/:code', component: Invite }
        ]
      },
      {
        path: 'admin',
        component: userIsAuthenticated(userIsAdmin(AdminHeader)),
        indexRoute: { component: AdminWallet },
        childRoutes: [
          { path: 'flagged', component: Flagged },
          { path: 'waitlist', component: Waitlist },
          { path: 'downvotes', component: Downvotes },
          { path: 'topics', component: TopicsAdmin },
          { path: 'invites', component: Invites },
          { path: 'email', component: Email },
          { path: 'topPosts', component: TopPosts },
          { path: 'community', component: CommuntiyAdmin }
        ]
      },
      { path: 'info', childRoutes: [{ path: 'faq', component: Faq }] },
      {
        path: ':community',
        indexRoute: { component: DiscoverContainer },
        childRoutes: [
          { path: ':sort', component: DiscoverContainer },
          { path: 'tag/:tag/::sort', component: DiscoverContainer },
          { path: 'tag/:tag/:sort', component: DiscoverContainer },
          {
            path: 'post/new',
            component: userIsAuthenticated(CreatePostContainer)
          },
          { path: 'post/:id', component: PostContainer }
        ]
      },
      { path: '*', component: NotFound }
    ]
  });
module.exports = routes;
