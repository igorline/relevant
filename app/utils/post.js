import { submitPost } from '../actions/post.actions';
import { toS3Advanced } from './s3';
var cheerio = require('cheerio-without-node-native');

export function generate(link, body, tags, token) {
 return fetch(link, {
      method: 'GET',
  })
  .then((response) => {
  var $ = cheerio.load(response._bodyText);
  var data = {
    'og:type':null,
    'og:title':null,
    'og:description':null,
    'og:image':null,
    'twitter:title':null,
    'twitter:image':null,
    'twitter:description':null,
    'twitter:site':null,
    'twitter:creator':null,
  }
  var meta = $('meta');
  var keys = Object.keys(meta);
  for (var s in data) {
    keys.forEach(function(key) {
      if ( meta[key].attribs
        && meta[key].attribs.property
        && meta[key].attribs.property === s) {
          data[s] = meta[key].attribs.content;
      }
    })
  }
  var description = null;
  var title = null;
  var image = null;

  if (data['og:title']) {
    title = data['og:title'];
  } else if (data['twitter:title']) {
    title = data['twitter:title'];
  }

  if (data['og:description']) {
    description = data['og:description'];
  } else if (data['twitter:description']) {
    description = data['twitter:description'];
  }

  if (data['og:image']) {
    image = data['og:image'];
  } else if (data['twitter:image']) {
    image = data['twitter:image'];
  }

  if (image) {
    return toS3Advanced(image).then(function(results){
      console.log(results, 's3 results')
      if (results.success) {
        var postBody = {
          link: link,
          tags: tags,
          body: body,
          title: title,
          description: description,
          image: results.url
        };
        return submitPost(postBody, token);
      } else {
        console.log('err');
        return false;
      }
    })
  } else {
    var postBody = {
      link: link,
      body: body,
      tags: tags,
      title: title,
      description: description,
      image: image
    };
    return submitPost(postBody, token);
  }
  })
  .catch((error) => {
      console.log(error, 'error');
      return false;
  });
}