export const SET_COMMENTS = 'SET_COMMENTS';
export const COMMENT_SUCCESS = 'COMMENT_SUCCESS';
export const COMMENT_FAILURE = 'COMMENT_FAILURE';

import * as utils from '../utils';

var request = require('superagent');

export function createComment(token, user, text, postID) {
    if(!token) token = utils.auth.getToken();

    var commentObj = {
        user: user,
        text: text,
        post: postID
    };

    return function(dispatch) {
        request
        .post('/api/comment?access_token=' + token)
        .send(commentObj)
        .end(function(error, response){
            if (error || !response.ok) {
                console.log(error, 'error')
                dispatch(commentFailure());
            } else {
                console.log(response, 'response')
                dispatch(commentSuccess(commentObj));
            }
        });
    }
}

export function getComments(postID) {
    return function(dispatch) {
        request
        .get('/api/comment?post=' + postID)
        .end(function(error, response){
            if (error || !response.ok) {
                console.log(error, 'error')
            } else {
                console.log('dispatching get comments')
                dispatch(setComments(response.body));
            }
        });
    }
}

function setComments(comments) {
    return {
        type: "SET_COMMENTS",
        payload: comments
    };
}

function commentSuccess(comment) {
    return {
        type: "COMMENT_SUCCESS",
        payload: comment
    };
}

function commentFailure() {
    return {
        type: "COMMENT_FAILURE",
        text: 'Something went wrong. Please try again'
    };
}