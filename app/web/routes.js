import React from 'react';
import { push } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';
import App from './components/app';
import Home from './components/main/main.container';
import Auth from './components/auth/auth.container';
// import ProfileContainer from './components/profile/profile.container';
// import MessageContainer from './components/message/message.container';
// import Posts from './components/post/post.container';
// import NewPostContainer from './components/post/newPost.container';
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
    indexRoute: { component: Home },
    childRoutes: [
      { path: 'faq', component: Faq },
      { path: 'login', component: Auth },
      { path: 'signup', component: Auth },
      { path: 'home', component: Home },
      { path: 'admin',
        component: userIsAuthenticated(userIsAdmin(AdminHeader)), onEnter: connect(userIsAuthenticated.onEnter),
        childRoutes: [
          { path: 'flagged', component: Flagged },
          { path: 'waitlist', component: Waitlist },
          { path: 'downvotes', component: Downvotes },
          { path: 'topics', component: TopicsAdmin },
          { path: 'invites', component: Invites },
        ]
      },

      { path: 'invite/:code', component: Invite },
      // { path: 'profile', component: userIsAuthenticated(ProfileContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'profile/:id', component: ProfileContainer },
      // { path: 'messages', component: userIsAuthenticated(MessageContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'post/new', component: userIsAuthenticated(NewPostContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'post/:id', component: Posts },
      // { path: 'discover', component: DiscoverContainer },
      // { path: 'discover/tag/:tag', component: DiscoverContainer },
      { path: 'resetPassword/:token', component: Auth },
      { path: 'confirm/:user/:code', component: Auth },
      { path: 'forgot', component: Auth },
      { path: '*', component: NotFound }
    ]
  };
};

module.exports = routes;
