import { submitPost } from '../actions/post.actions';
import { toS3Advanced } from './s3';

const cheerio = require('cheerio-without-node-native');

export function generatePreview(link) {
  console.log(link, 'generate preview link');
  return fetch(link, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
  .then((response) => {
    //console.log(response, 'first response');
    return response.text();
  })
  .then((responseTxt) => {
    //console.log(responseTxt, 'responseTxt')
    const $ = cheerio.load(responseTxt);
    let data = {
      'og:type': null,
      'og:title': null,
      'og:description': null,
      'og:image': null,
      'twitter:title': null,
      'twitter:image': null,
      'twitter:description': null,
      'twitter:site': null,
      'twitter:creator': null,
    };
    const meta = $('meta');
    const keys = Object.keys(meta);

    for (var s in data) {
      keys.forEach((key) => {
        if (meta[key].attribs
          && meta[key].attribs.property
          && meta[key].attribs.property === s) {
          data[s] = meta[key].attribs.content;
        }
      });
    }

    let description = null;
    let title = null;
    let image = null;

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

    const obj = {
      image,
      description,
      title,
    };
    return obj;
  })
  .catch((error) => {
    console.log(error, 'error');
    return false;
  });
}

export function generate(link, body, tags, token) {
  console.log(link, 'link')
  return fetch(link, {
    method: 'GET',
  })
  .then((response) => {
    return response.text();
  })
  .then((responseTxt) => {
    const $ = cheerio.load(responseTxt);
    let data = {
      'og:type': null,
      'og:title': null,
      'og:description': null,
      'og:image': null,
      'twitter:title': null,
      'twitter:image': null,
      'twitter:description': null,
      'twitter:site': null,
      'twitter:creator': null,
    };
    const meta = $('meta');
    const keys = Object.keys(meta);
    for (var s in data) {
      keys.forEach((key) => {
        if (meta[key].attribs
          && meta[key].attribs.property
          && meta[key].attribs.property === s) {
          data[s] = meta[key].attribs.content;
        }
      });
    }
    let description = null;
    let title = null;
    let image = null;

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

    let postBody = null;

    if (image) {
      return toS3Advanced(image).then((results) => {
        if (results.success) {
          postBody = {
            link,
            tags,
            body,
            title,
            description,
            image: results.url,
            investments: [],
          };
          return submitPost(postBody, token);
        } else {
          console.log('err');
          return false;
        }
      });
    } else {
      postBody = {
        link,
        body,
        tags,
        title,
        description,
        image,
        investments: [],
      };
      return submitPost(postBody, token);
    }
  })
  .catch((error) => {
    console.log(error, 'error');
    return false;
  });
}
