export const CONCAT_POSTS = 'CONCAT_POSTS';

var request = require('superagent');

export function getNewPosts(limit, skip) {
  console.info('getting new posts... limit: ' + limit + ', skip: ' + skip);
  return function(dispatch) {
    request
    .get('/api/post/')
    .query({
      limit: limit,
      skip: skip
    })
    .end(function(error, response){
      if (error || !response.ok) {
        console.log(error, 'error');
      } else {
        console.info('new posts received:', response.body)
        dispatch(concatPosts(response.body));
      }
    })
  }
}

export function topSort(posts) {
  return function(dispatch) {
    var topPosts = 
      posts.sort(function(a, b) {
        return b.rank - a.rank;
      });
    dispatch(concatPosts(topPosts));
  }
}

export function newSort(posts) {
  return function(dispatch) {
    var newPosts = 
      posts.sort(function(a, b) {
        return (new Date(b.createdAt) - new Date(a.createdAt));
      });

    dispatch(concatPosts(newPosts));
  }
}

export function getPostsByTag(tagName) {
  return function(dispatch) {
    request
    .get('/api/tag/search/' + tagName)
    .end(function(error, response){
      if (error || !response.ok) {
        console.log(error, 'error');
      } else {
        var tag = response.body[0];

        new Promise((resolve, reject) => {
          request
            .get('/api/post')
            .query({ 
              tag: tag._id,
            })
            .end(function(err, res) {
              if (err) {
                reject(err);
              }
              resolve(res);
            });
        }).then(function(res) {
          dispatch(concatPosts(res.body))
        }, function(err) {
          console.log(err);
        });
      }
    });
  }
}

function concatPosts(posts) {
  return {
    type: "CONCAT_POSTS",
    payload: posts
  };
}