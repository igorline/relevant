import {
  REFRESH_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS,
  SET_VIEW,
  TOGGLE_TOPICS,
  SCROLL,
  SET_WEB_VIEW,
  SHOW_MODAL,
  HIDE_MODAL
} from 'core/actionTypes';
import { setButtonTooltip } from 'modules/tooltip/tooltip.actions';
import { dispatchNavigatorAction } from 'app/utils/nav';

let dismissKeyboard;
let safariView;
let Orientation;
let NavigationActions;
let StackActions;

if (process.env.WEB !== 'true') {
  Orientation = require('react-native-orientation');
  dismissKeyboard = require('react-native-dismiss-keyboard');
  safariView = require('react-native-safari-view').default;
  NavigationActions = require('react-navigation').NavigationActions;
  StackActions = require('react-navigation').StackActions;
}

export function showModal(modal) {
  return {
    type: SHOW_MODAL,
    payload: modal
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

export function push(route) {
  return () => {
    // check if we need this
    if (dismissKeyboard) dismissKeyboard();
    dispatchNavigatorAction(
      NavigationActions.navigate({ routeName: route.key, params: route })
    );
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
        title: topic.categoryName,
        back: true,
        id: topic._id || topic.topic,
        topic,
        gestureResponseDistance: 150
      })
    );
    dispatch(toggleTopics(false));
  };
}

export function setView(type, view) {
  return {
    type: SET_VIEW,
    payload: {
      type,
      view
    }
  };
}

export function setWebView(type, params) {
  return {
    type: SET_WEB_VIEW,
    payload: {
      type,
      params
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
  return dispatch => {
    dispatch(setButtonTooltip('upvote', id));
    if (safariView) {
      safariView
      .isAvailable()
      .then(() => {
        Orientation.unlockAllOrientations();
        safariView.show({
          url,
          readerMode: true // optional,
        });
      })
      .catch(() => {
        dispatch(
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
      });
    }
  };
}

export function goToComments(post, key, animation) {
  return push(
    {
      key: 'comment',
      title: 'Comments',
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
    id: post._id,
    commentCount: post.commentCount,
    openComment
  });
}

export function goToProfile(user, key, animation) {
  const handle = user.handle || user.replace('@', '');
  return push(
    {
      key: 'profile',
      title: user.name,
      back: true,
      id: handle
    },
    key,
    animation
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
