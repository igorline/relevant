export const CREATE_NEW_POST = 'CREATE_NEW_POST';
export const NEW_POST_REQUEST = 'NEW_POST_REQUEST';
export const NEW_POST_SUCCESS = 'NEW_POST_SUCCESS';
export const TEXT_POST_FAILURE = 'TEXT_POST_FAILURE';
export const LINK_POST_FAILURE = 'LINK_POST_FAILURE';
export const IMAGE_POST_FAILURE = 'IMAGE_POST_FAILURE';

import { push } from 'react-router-redux';
import * as utils from '../utils';

var request = require('superagent');
var token = utils.auth.getToken();
var FormData = require('form-data');

export function createNewPost(post) {
  return function(dispatch) {
    dispatch(newPostRequest());

    console.log(post, 'post here');

    // if (post.tags) {

    //   post.tags = post.tags.split(/[ ,]+/);
    // } else {
    //   post.tags = [];
    // }

    // If an image post, upload pic to s3 first
    if (post.image) {
      var image = post.image;
      utils.s3.addImageFromURL(image).then(function(url) {
        post.image = url;
        uploadPost(post, dispatch, IMAGE_POST_FAILURE);
      }, function(err) {
        console.log(err);
        dispatch(newPostFailure(IMAGE_POST_FAILURE));
      });

    // If a link post, scrape meta tags first
    } else {
      uploadPost(post, dispatch, TEXT_POST_FAILURE);
    }
    // else if ((post.link) && !(post.link.trim() === '')) {
    //   utils.link.addMetaTags(post).then(function(updatedPost) {
    //     updatedPost.link = utils.link.ensureURL(updatedPost.link);
    //     uploadPost(updatedPost, dispatch, LINK_POST_FAILURE);
    //   }, function(err) {
    //     console.log(err);
    //     dispatch(newPostFailure(LINK_POST_FAILURE));
    //   });
    // }
  };
}

// Makes POST call to server to create post and then redirects to the post
function uploadPost(post, dispatch, failureType) {
  new Promise((resolve, reject) => {
    request
      .post('/api/post')
      .set({
        'Authorization': `Bearer ${token}`
      })
      .send(post)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        if (err || res.error) {
          reject(err);
        }
        var postRoute = '/post/' + res.body._id;
        resolve(postRoute);
      });
  }).then(function(postRoute) {
    dispatch(push(postRoute));
    dispatch(newPostSuccess());
  }, function(err) {
    console.log(err);
    dispatch(newPostFailure(failureType));
  });
}

export function newPostRequest() {
  return {
    type: NEW_POST_REQUEST,
  };
}

export function newPostSuccess() {
  return {
    type: NEW_POST_SUCCESS,
  };
}

export function newPostFailure(failureType) {
  return {
    type: failureType,
    text: 'Something went wrong. Please try again'
  };
}