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
