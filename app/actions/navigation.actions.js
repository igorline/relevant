import {
  POP_ROUTE,
  PUSH_ROUTE,
  CHANGE_TAB,
  RESET_ROUTES,
  REFRESH_ROUTE,
  REPLACE_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS,
  SHOW_TOOLTIP,
  SET_VIEW,
  TOGGLE_TOPICS,
  SCROLL,
  SET_TOOLTIP_DATA,
  TOOLTIP_READY,
  SET_BUTTON_TOOLTIP,
} from './actionTypes';

let dismissKeyboard;
let safariView;
let Orientation;
if (process.env.WEB != 'true') {
  Orientation = require('react-native-orientation');
  dismissKeyboard = require('react-native-dismiss-keyboard');
  safariView = require('react-native-safari-view').default;

  console.log(Orientation);
  // safariView.addEventListener(
  //   'onDismiss',
  //   () => {
  //     Orientation.lockToPortrait();
  //   }
  // );
}

export function push(route, key, animation = 'vertical') {
  if (dismissKeyboard) dismissKeyboard();
  return {
    type: PUSH_ROUTE,
    route,
    key,
    animation
  };
}

export function scrolling(scroll) {
  return {
    type: SCROLL,
    payload: scroll
  };
}

export function toggleTopics(showTopics) {
  return {
    type: TOGGLE_TOPICS,
    payload: showTopics,
  };
}

export function pop(key) {
  return dispatch => {
    if (dismissKeyboard) dismissKeyboard();
    dispatch(toggleTopics(false));
    dispatch({
      type: POP_ROUTE,
      key
    });
  };
}

export function changeTab(key) {
  if (dismissKeyboard) dismissKeyboard();
  return {
    type: CHANGE_TAB,
    key
  };
}

export function goToTopic(topic) {
  return dispatch => {
    // dispatch(changeTab('discover'));
    dispatch(push({
      key: 'discover',
      title: topic.categoryName,
      back: true,
      id: topic._id,
      topic,
      gestureResponseDistance: 150,
    }));
    dispatch(toggleTopics(false));
  };
}

export function setView(type, view) {
  return {
    type: SET_VIEW,
    payload: {
      view,
      type
    }
  };
}

export function setButtonTooltip(type, id) {
  return {
    type: SET_BUTTON_TOOLTIP,
    payload: { id, type }
  };
}


export function tooltipReady(ready) {
  return {
    type: TOOLTIP_READY,
    payload: ready
  };
}

export function setTooltipData(data) {
  return {
    type: SET_TOOLTIP_DATA,
    payload: data
  };
}

export function showTooltip(name) {
  return {
    type: SHOW_TOOLTIP,
    payload: name
  };
}


export function createToggleAction(name, el) {
  return dispatch => {
    if (!el) return;
    el.measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      dispatch(setTooltipData({
        name,
        parent
      }));
      dispatch(showTooltip(name));
    });
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
    type: RELOAD_ALL_TABS,
  };
}


export function resetRoutes(key) {
  return {
    type: RESET_ROUTES,
    key
  };
}

export function replaceRoute(route, index, key) {
  return {
    type: REPLACE_ROUTE,
    payload: {
      key,
      index,
      route
    }
  };
}

export function goToPeople(topic) {
  return push({
    key: 'peopleView',
    component: 'peopleView',
    title: topic ? '#' + topic : 'People',
    back: true,
    id: topic + '_' + 'people',
    topic: topic ? { _id: topic.toLowerCase() } : null,
  });
}


export function goToUrl(url, id) {
  return dispatch => {
    dispatch(setButtonTooltip('upvote', id));
    if (safariView) {
      safariView.isAvailable()
      .then(() => {
        Orientation.unlockAllOrientations();
        safariView.show({
          url,
          readerMode: true, // optional,
          // tintColor: '#ffffff', // optional
          // barTintColor: '#ffffff' // optional
        });
        // dispatch(tooltipReady());
      })
      .catch(err => {
        console.log(err);
        // dispatch(tooltipReady());
        dispatch(push({
          key: 'articleView',
          component: 'articleView',
          back: true,
          uri: url,
          id: url,
          gestureResponseDistance: 120
        }, 'home'));
      });
    }
  };
}

export function goToComments(post, key, animation) {
  return push({
    key: 'comment',
    title: 'Comments',
    back: true,
    id: post._id
  }, key, animation);
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
  let handle = user._id || user.replace('@', '');
  return push({
    key: 'profile',
    title: user.name || handle,
    back: true,
    id: handle,
  }, key, animation);
}

export function viewBlocked() {
  return push({
    key: 'blocked',
    title: 'Blocked Users',
    id: 'blocked',
    back: true,
  });
}

export function viewInvites() {
  return push({
    key: 'invites',
    title: 'Invite Friends',
    id: 'invites',
    back: true,
  });
}

export function goToInviteList() {
  return push({
    key: 'inviteList',
    title: 'Invite List',
    id: 'inviteList',
    back: true,
  });
}


