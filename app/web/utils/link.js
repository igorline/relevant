import { addImageFromURL } from './s3';
import url from 'url';
var request = require('superagent');


// Ensures that given link has protocol (http://) so browser renders as absolute path
export function ensureURL(uri) {
  if (!url.parse(uri).protocol) {
          uri = 'http://' + uri;
  }
  return uri;
}

// Calls server to scrap meta tags from link and adds them to post
export function addMetaTags(post) {
  return new Promise((resolve, reject) => {
    request
      .get('/api/metatag')
      .query({
        url: post.link
      })
      .end(function(err, res) {
        if (err) reject(err);
        post.description = res.body.description;
        post.title = res.body.title;
        // If no title was scraped, just make it the link url
        if (!post.title) post.title = post.link;
        var image = res.body.image;
        if (image) {
          addImageFromURL(image).then(function(url) {
            post.image = 'https://' + url;
            resolve(post);
          }, function(err) {
            console.log(err);
          });
        } else {
          resolve(post);
        }
      });
  });
}
