import {
  POP_ROUTE,
  PUSH_ROUTE,
  CHANGE_TAB,
  RESET_ROUTES,
  REFRESH_ROUTE,
  REPLACE_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS
} from './actionTypes';

export function push(route, key, animation = 'vertical') {
  return {
    type: PUSH_ROUTE,
    route,
    key,
    animation
  };
}

export function pop(key) {
  return {
    type: POP_ROUTE,
    key
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

export function changeTab(key) {
  return {
    type: CHANGE_TAB,
    key
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

export function goToComments(post, key, animation) {
  return push({
    key: 'comment',
    title: 'Comments',
    back: true,
    id: post._id
  }, key, animation);
}

export function goToPost(post, key, animation) {
  return push({
    key: 'singlePost',
    title: post.title,
    back: true,
    id: post._id
  }, key, animation);
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
