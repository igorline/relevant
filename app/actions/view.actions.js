import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';

export function setView(type, view, category) {
    return {
        type: 'SET_VIEW',
        payload: {
          view: view ? view : null,
          category: category ? true : false,
          type: type
        }
    };
}

export function setNav(nav, route) {
    return {
        type: 'SET_NAV',
        payload: {
          nav: nav ? nav : null,
          route: route ? route : null
        }
    };
}

export function setBack(bool) {
    return {
        type: 'SET_BACK',
        payload: bool
    };
}

export function setName(name) {
    if (!name) name = null;
    return {
        type: 'SET_NAME',
        payload: name
    };
}