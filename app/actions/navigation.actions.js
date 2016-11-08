import {
  POP_ROUTE,
  PUSH_ROUTE,
  CHANGE_TAB,
  RESET_ROUTES,
  REFRESH_ROUTE
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
