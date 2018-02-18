import React from 'react';
import { push } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';
import App from './components/app';
import Splash from './components/splash/splash.container';
import Discover from './components/discover/discover.container';
import Auth from './components/auth/auth.container';
import ProfileContainer from './components/profile/profile.container';
// import MessageContainer from './components/message/message.container';
import PostContainer from './components/post/post.container';
import CreatePostContainer from './components/createPost/createPost.container';
// import DiscoverContainer from './components/discover/discover.container';
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
import BondingCurve from './components/bonding-curve-ui/src/App';

// Redirects to /login by default
const userIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.auth.user, // how to get the user state
  redirectAction: push, // the redux action to dispatch for redirect
  wrapperDisplayName: 'UserIsAuthenticated' // a nice name for this auth check
});

const userIsAdmin = UserAuthWrapper({
  authSelector: state => state.auth.user,
  wrapperDisplayName: 'UserIsAdmin',
  redirectAction: push,
  // failureRedirectPath: '/login',
  // allowRedirectBack: false,
  predicate: user => user.role === 'admin'
});

let routes = (store) => {
  // console.log('router store', store)
  const connect = (fn) => (nextState, replaceState) => fn(store, nextState, replaceState);
  return {
    path: '/',
    component: App,
    indexRoute: { component: Splash },
    childRoutes: [
      { path: 'faq', component: Faq },
      { path: 'login', component: Auth },
      { path: 'signup', component: Auth },
      { path: 'splash', component: Splash },
      { path: 'home', component: Discover },
      { path: 'discover', component: Discover },
      { path: 'discover', component: Discover },
      { path: 'discover/:sort', component: Discover },
      { path: 'discover/tag/:tag', component: Discover },
      { path: 'discover/tag/:tag/:sort', component: Discover },
      { path: 'admin',
        component: userIsAuthenticated(userIsAdmin(AdminHeader)),
        onEnter: connect(userIsAuthenticated.onEnter),
        childRoutes: [
          { path: 'flagged', component: Flagged },
          { path: 'waitlist', component: Waitlist },
          { path: 'downvotes', component: Downvotes },
          { path: 'topics', component: TopicsAdmin },
          { path: 'invites', component: Invites },
          { path: 'email', component: Email },
          { path: 'topPosts', component: TopPosts },
        ]
      },

      { path: 'invite/:code', component: Invite },
      { path: 'profile', component: userIsAuthenticated(ProfileContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      { path: 'profile/:id', component: ProfileContainer },
      // { path: 'messages', component: userIsAuthenticated(MessageContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      { path: 'post/new', component: userIsAuthenticated(CreatePostContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      { path: 'post/:id', component: PostContainer },
      // { path: 'discover', component: DiscoverContainer },
      { path: 'resetPassword/:token', component: Auth },
      { path: 'confirm/:user/:code', component: Auth },
      { path: 'forgot', component: Auth },
      { path: 'bonding', component: BondingCurve },
      { path: '*', component: NotFound }
    ]
  };
};

module.exports = routes;
