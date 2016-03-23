import * as types from './actionTypes';
import {
    push
}
from 'react-router-redux';
import request from 'superagent';
import thunk from 'redux-thunk';
// var AddressBook = require('react-native-addressbook')
var Contacts = require('react-native-contacts');
require('../secrets.js');

export
function setUser(user) {
    return {
        type: types.SET_USER,
        payload: user
    };
}

export
function setUserIndex(userIndex) {
    return {
        type: types.SET_USER_INDEX,
        payload: userIndex
    };
}

export
function loginUserSuccess(token) {
    return {
        type: types.LOGIN_USER_SUCCESS,
        payload: {
            token: token
        }
    };
}

export
function loginUserFailure(error) {
    return {
        type: types.LOGIN_USER_FAILURE,
        payload: {
            status: '',
            statusText: error
        }
    };
}

export
function loginUserRequest() {
    return {
        type: types.LOGIN_USER_REQUEST
    }
}

export
function logout() {
    return {
        type: types.LOGOUT_USER
    }
}

export
function logoutAndRedirect() {
    // return (dispatch, state) => {
    //   dispatch(logout());
    //   dispatch(push('/login'));
    // }
}

export
function loginUser(user, redirect) {
    return function(dispatch) {
        dispatch(loginUserRequest());
        fetch('http://'+process.env.SERVER_IP+':3000/auth/local', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: user
        })
            .then((response) => response.json())
            .then((responseJSON) => {
                console.log(responseJSON, 'response');
                if (responseJSON.token) {
                    dispatch(loginUserSuccess(responseJSON.token));
                    dispatch(getUser(responseJSON.token, redirect));
                } else {
                    dispatch(loginUserFailure(responseJSON.message));
                }
            })
            .catch((error) => {
                console.log(error, 'error');
                dispatch(loginUserFailure('Server error'));
            });
    }
}

export
function createUser(user, redirect) {
    return function(dispatch) {
        dispatch(loginUserRequest());
        fetch('http://'+process.env.SERVER_IP+':3000/api/user', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: user
        })
            .then((response) => response.json())
            .then((responseJSON) => {
                console.log(responseJSON, 'response');
                if (responseJSON.token) {
                    dispatch(loginUserSuccess(responseJSON.token));
                    dispatch(getUser(responseJSON.token, redirect));
                } else {
                    dispatch(loginUserFailure(responseJSON.message));
                }
            })
            .catch((error) => {
                console.log(error, 'error');
                dispatch(loginUserFailure('Server error'));
            });
    }
}

export
function getUser(token, redirect) {
    return dispatch => {
        console.log('get user')
        new Promise(function(resolve, reject) {
            if (!token) return dispatch(setUser());

            return fetch('http://'+process.env.SERVER_IP+':3000/api/user/me', {
                    credentials: 'include',
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then((response) => response.json())
                .then((responseJSON) => {
                    console.log(responseJSON, 'response');
                    dispatch(setUser(responseJSON));
                })
                .catch((error) => {
                    console.log(error, 'error');
                });
        })
    }
}

export
function userIndex() {
    console.log('user index action')
    return dispatch => {
        console.log('userIndex')
        new Promise(function(resolve, reject) {
            return fetch('http://'+process.env.SERVER_IP+':3000/api/user', {
                    credentials: 'include',
                    method: 'GET'
                    // headers: {'Authorization': `Bearer ${token}`}
                })
                .then((response) => response.json())
                .then((responseJSON) => {
                    console.log(responseJSON, 'response');
                    dispatch(setUserIndex(responseJSON));
                })
                .catch((error) => {
                    console.log(error, 'error');
                });
        })
    }
}

export
function getContacts() {
    return function(dispatch) {
        console.log('trigger get contacts')
        // AddressBook.getContacts(function (err, contacts) {
        //   if (err && err.type === 'permissionDenied') {
        //     console.log(err);
        //   } else if (err) {
        //     console.log(err);
        //   } else {
        //     dispatch(setContacts(contacts));
        //   }
        // });
        Contacts.getAll((err, contacts) => {
            if (err && err.type === 'permissionDenied') {
                // x.x
            } else {
                dispatch(setContacts(contacts));
            }
        });
    }
}

export
function sortNumbers(contacts) {
    return function(dispatch) {
        var list = [];
        for (var i = 0; i < contacts.length; i++) {
            for (var x = 0; x < contacts[i].phoneNumbers.length; x++) {
                var altNum = contacts[i].phoneNumbers[x].number.replace(/\D/g, '');
                var num = Number(altNum);
                list.push(num);
                if (i == contacts.length - 1 && x == contacts[i].phoneNumbers.length - 1) dispatch(setContacts(list));
            };
        };
    }
}

export
function setContacts(contacts) {
    return {
        type: types.SET_CONTACTS,
        payload: contacts
    };
}

export
function getToken() {
    var token = cookie.load('token');
    return token;
}

// export
// function S3Upload() {
//   return function(dispatch) {
//      S3Upload.prototype.s3_object_name = 'default_name';

//     S3Upload.prototype.s3_sign_put_url = '/signS3put';

//     S3Upload.prototype.file_dom_selector = 'file_upload';

//     S3Upload.prototype.onFinishS3Put = function(public_url) {
//       return console.log('base.onFinishS3Put()', public_url);
//     };

//     S3Upload.prototype.onProgress = function(percent, status) {
//       return console.log('base.onProgress()', percent, status);
//     };

//     S3Upload.prototype.onError = function(status) {
//       return console.log('base.onError()', status);
//     };

//     function S3Upload(options) {
//       if (options == null) options = {};
//       for (option in options) {
//         this[option] = options[option];
//       }
//       this.handleFileSelect(this.files);
//     }

//     S3Upload.prototype.handleFileSelect = function(files) {
//       var f, output, _i, _len, _results;
//       this.onProgress(0, 'Upload started.');
//       output = [];
//       _results = [];
//       for (_i = 0, _len = files.length; _i < _len; _i++) {
//         f = files[_i];
//         _results.push(this.uploadFile(f));
//       }
//       return _results;
//     };

//     S3Upload.prototype.createCORSRequest = function(method, url) {
//       var xhr;
//       xhr = new XMLHttpRequest();
//       if (xhr.withCredentials != null) {
//         xhr.open(method, url, true);
//       } else if (typeof XDomainRequest !== "undefined") {
//         xhr = new XDomainRequest();
//         xhr.open(method, url);
//       } else {
//         xhr = null;
//       }
//       return xhr;
//     };

//     S3Upload.prototype.executeOnSignedUrl = function(file, callback) {
//       var this_s3upload, xhr;
//       this_s3upload = this;
//       xhr = new XMLHttpRequest();
//       xhr.open('GET', this.s3_sign_put_url + '?s3_object_type=' + file.type + '&s3_object_name=' + this.s3_object_name, true);
//       xhr.overrideMimeType('text/plain; charset=x-user-defined');
//       xhr.onreadystatechange = function(e) {
//         var result;
//         if (this.readyState === 4 && this.status === 200) {
//           try {
//             result = JSON.parse(this.responseText);
//           } catch (error) {
//             this_s3upload.onError('Signing server returned some ugly/empty JSON: "' + this.responseText + '"');
//             return false;
//           }
//           return callback(result.signed_request, result.url);
//         } else if (this.readyState === 4 && this.status !== 200) {
//           return this_s3upload.onError('Could not contact request signing server. Status = ' + this.status);
//         }
//       };
//       return xhr.send();
//     };

//     S3Upload.prototype.uploadToS3 = function(file, url, public_url) {
//       var this_s3upload, xhr;
//       this_s3upload = this;
//       xhr = this.createCORSRequest('PUT', url);
//       if (!xhr) {
//         this.onError('CORS not supported');
//       } else {
//         xhr.onload = function() {
//           if (xhr.status === 200) {
//             this_s3upload.onProgress(100, 'Upload completed.');
//             return this_s3upload.onFinishS3Put(public_url);
//           } else {
//             return this_s3upload.onError('Upload error: ' + xhr.status);
//           }
//         };
//         xhr.onerror = function() {
//           return this_s3upload.onError('XHR error.');
//         };
//         xhr.upload.onprogress = function(e) {
//           var percentLoaded;
//           if (e.lengthComputable) {
//             percentLoaded = Math.round((e.loaded / e.total) * 100);
//             return this_s3upload.onProgress(percentLoaded, percentLoaded === 100 ? 'Finalizing.' : 'Uploading.');
//           }
//         };
//       }
//       xhr.setRequestHeader('Content-Type', file.type);
//       xhr.setRequestHeader('x-amz-acl', 'public-read');
//       return xhr.send(file);
//     };

//     S3Upload.prototype.uploadFile = function(file) {
//       var this_s3upload;
//       this_s3upload = this;
//       return this.executeOnSignedUrl(file, function(signedURL, publicURL) {
//         return this_s3upload.uploadToS3(file, signedURL, publicURL);
//       });
//     };

//     return S3Upload;
//   }
// }
