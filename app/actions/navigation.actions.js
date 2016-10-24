import { POP_ROUTE, PUSH_ROUTE, CHANGE_TAB } from './actionTypes';

export function push(route) {
  return {
    type: PUSH_ROUTE,
    route
  };
}

export function pop(tabKey) {
  return {
    type: POP_ROUTE,
    tabKey
  };
}

export function changeTab(tabKey) {
  return {
    type: CHANGE_TAB,
    tabKey
  };
}
