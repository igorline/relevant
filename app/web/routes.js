import React from 'react';
import { push } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';
import App from './components/app';
import Home from './components/main/main.container';
import Login from './components/auth/auth.container';
// import ProfileContainer from './components/profile/profile.container';
// import MessageContainer from './components/message/message.container';
// import Posts from './components/post/post.container';
// import NewPostContainer from './components/post/newPost.container';
// import DiscoverContainer from './components/discover/discover.container';
import NotFound from './components/404';
import TopicsAdmin from './components/common/topics.container';

// Redirects to /login by default
const userIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.auth.user, // how to get the user state
  redirectAction: push, // the redux action to dispatch for redirect
  wrapperDisplayName: 'UserIsAuthenticated' // a nice name for this auth check
});

// const connect = (fn) => (nextState, replaceState) => fn(store, nextState, replaceState);

let routes = (store) => {
  const connect = (fn) => (nextState, replaceState) => fn(store, nextState, replaceState);
  return {
    path: '/',
    component: App,
    indexRoute: { component: Home },
    childRoutes: [
      { path: 'login', component: Login },
      { path: 'signup', component: Login },
      { path: 'home', component: Home },
      { path: 'topics', component: userIsAuthenticated(TopicsAdmin), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'profile', component: userIsAuthenticated(ProfileContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'profile/:id', component: ProfileContainer },
      // { path: 'messages', component: userIsAuthenticated(MessageContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'post/new', component: userIsAuthenticated(NewPostContainer), onEnter: connect(userIsAuthenticated.onEnter) },
      // { path: 'post/:id', component: Posts },
      // { path: 'discover', component: DiscoverContainer },
      // { path: 'discover/tag/:tag', component: DiscoverContainer },
      { path: '*', component: NotFound }
    ]
  };
};

module.exports = routes;
