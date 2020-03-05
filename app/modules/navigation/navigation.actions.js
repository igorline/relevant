import {
  REFRESH_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS,
  SET_SCROLL_TAB,
  TOGGLE_TOPICS,
  SCROLL,
  SHOW_MODAL,
  HIDE_MODAL,
  OPEN_WEB_SIDE_NAV,
  CLOSE_WEB_SIDE_NAV,
  SET_WIDTH,
  REGISTER_GESTURE,
  LOCK_DRAWER
} from 'core/actionTypes';
import { setButtonTooltip } from 'modules/tooltip/tooltip.actions';
import { dispatchNavigatorAction, getScreenSize } from 'app/utils/nav';
import { setCommunity } from 'modules/auth/auth.actions'; // eslint-disable-line

let dismissKeyboard;
let safariView;
let Orientation;
let NavigationActions;
let StackActions;
let DrawerActions;
let Linking;
let native;

const isNative = process.env.WEB !== 'true';

if (process.env.WEB !== 'true') {
  Orientation = require('react-native-orientation');
  dismissKeyboard = require('react-native-dismiss-keyboard');
  safariView = require('react-native-safari-view').default;
  NavigationActions = require('react-navigation').NavigationActions;
  StackActions = require('react-navigation').StackActions;
  DrawerActions = require('react-navigation-drawer').DrawerActions;
  Linking = require('react-native').Linking;
  native = true;
}

export function showAuth() {
  return dispatch =>
    isNative
      ? dispatchNavigatorAction(NavigationActions.navigate({ routeName: 'auth' }))
      : dispatch(showModal('login'));
}

export function lockDrawer(lock) {
  return {
    type: LOCK_DRAWER,
    payload: lock
  };
}

export function showModal(modal, data) {
  return {
    type: SHOW_MODAL,
    payload: {
      modal,
      data
    }
  };
}

export function hideModal(modal) {
  return {
    type: HIDE_MODAL,
    payload: modal
  };
}

export function scrolling(scroll) {
  return {
    type: SCROLL,
    payload: scroll
  };
}

export function registerGesture(gesture) {
  return {
    type: REGISTER_GESTURE,
    payload: gesture
  };
}

export function closeDrawer() {
  return () => (native ? dispatchNavigatorAction(DrawerActions.closeDrawer()) : null);
}

export function push(route) {
  return dispatch => {
    if (dismissKeyboard) dismissKeyboard();
    if (native) {
      dispatchNavigatorAction(DrawerActions.closeDrawer());
      dispatchNavigatorAction(
        NavigationActions.navigate({ routeName: route.key || route, params: route })
      );
    }
    // check if we need this
    // console.log('c', route.community, route.community !== 'undefined');
    if (route.community && route.community !== '') {
      requestAnimationFrame(() => dispatch(setCommunity(route.community)));
    }
  };
}

export function pop() {
  return () => {
    dispatchNavigatorAction(NavigationActions.back());
  };
}

export function replace(key) {
  return () => {
    dispatchNavigatorAction(StackActions.replace({ routeName: key }));
  };
}

export function toggleTopics(showTopics) {
  return {
    type: TOGGLE_TOPICS,
    payload: showTopics
  };
}

export function goToTab(tab) {
  return () => {
    if (!native) return;
    dispatchNavigatorAction(DrawerActions.closeDrawer());
    dispatchNavigatorAction(
      NavigationActions.navigate({
        routeName: tab
      })
    );
  };
}

export function resetTabs() {
  return () => {
    if (!native) return;
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'main' })]
    });
    dispatchNavigatorAction(resetAction);
  };
}

export function goToTopic(topic) {
  return dispatch => {
    dispatchNavigatorAction(
      NavigationActions.navigate({
        routeName: 'discover'
      })
    );

    dispatch(
      push({
        key: 'discoverTag',
        title: topic.categoryName || topic,
        back: true,
        id: topic._id || topic.topic || topic,
        topic,
        gestureResponseDistance: 150
      })
    );
    dispatch(toggleTopics(false));
  };
}

export function setScrollTab(type, view) {
  return {
    type: SET_SCROLL_TAB,
    payload: {
      type,
      view
    }
  };
}

export function setWidth(width) {
  const screenSize = getScreenSize(width);
  return {
    type: SET_WIDTH,
    payload: {
      width,
      screenSize
    }
  };
}

export function refreshTab(key) {
  return {
    type: REFRESH_ROUTE,
    key
  };
}

export function reloadTab(key) {
  return {
    type: RELOAD_ROUTE,
    key
  };
}

export function reloadAllTabs() {
  return {
    type: RELOAD_ALL_TABS
  };
}

export function openWebSideNav() {
  return {
    type: OPEN_WEB_SIDE_NAV
  };
}

export function closeWebSideNav() {
  return {
    type: CLOSE_WEB_SIDE_NAV
  };
}

export function goToPeople(topic) {
  return push({
    key: 'peopleView',
    component: 'peopleView',
    title: topic ? '#' + topic : 'People',
    back: true,
    id: topic + '_people',
    topic: topic ? { _id: topic.toLowerCase() } : null
  });
}

export function goToUrl(url, id) {
  return async dispatch => {
    try {
      if (url.match('mailto:')) return Linking.openURL(url);
      dispatch(setButtonTooltip('upvote', id));
      if (!safariView) return null;
      await safariView.isAvailable();
      Orientation.unlockAllOrientations();
      return safariView.show({
        url,
        readerMode: true
      });
    } catch (err) {
      return dispatch(
        push(
          {
            key: 'articleView',
            component: 'articleView',
            back: true,
            uri: url,
            id: url,
            gestureResponseDistance: 120
          },
          'home'
        )
      );
    }
  };
}

export function goToComments(post, key, animation) {
  return push(
    {
      key: 'comment',
      title: 'Comments',
      community: post.data ? post.data.community : post.community,
      back: true,
      id: post._id
    },
    key,
    animation
  );
}

export function goToPost(post, openComment) {
  return push({
    key: 'singlePost',
    title: post.title ? post.title : '',
    back: true,
    community: post.data ? post.data.community : post.community,
    id: post._id,
    comment: post.comment,
    commentCount: post.commentCount,
    openComment
  });
}

export function goToProfile(user, key) {
  const handle = user.handle || user.replace('@', '');
  return push(
    {
      key: 'profile',
      title: user.name,
      back: true,
      id: handle
    },
    key
  );
}

export function viewBlocked() {
  return push({
    key: 'blocked',
    title: 'Blocked Users',
    id: 'blocked',
    back: true
  });
}

export function viewInvites() {
  return push({
    key: 'invites',
    title: 'Invite Friends',
    id: 'invites',
    back: true
  });
}

export function goToInviteList() {
  return push({
    key: 'inviteList',
    title: 'Invite List',
    id: 'inviteList',
    back: true
  });
}
