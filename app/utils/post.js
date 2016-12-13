const cheerio = require('cheerio-without-node-native');

export function generatePreview(link) {
  let responseUrl;
  return fetch(link, {
    method: 'GET',
  })
  .then((response) => {
    responseUrl = response.url;
    return response.text();
  })
  .then((responseTxt) => {
    const $ = cheerio.load(responseTxt);
    let data = {
      title: null,
      description: null,
      image: null,
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
    const $title = $('title');
    const keys = Object.keys(meta);

    data.title = $title.eq(0).text();

    for (let s in data) {
      keys.forEach((key) => {
        if (meta[key].attribs
          && (meta[key].attribs.property === s
          || meta[key].attribs.name === s
          || meta[key].attribs.itemprop === s)
        ) {
          data[s] = meta[key].attribs.content;
        }
      });
    }

    if (data.image && data.image.indexOf('http://') !== 0 &&
        data.image.indexOf('https://') !== 0) {
      data.image = responseUrl + data.image;
    }

    let description = null;
    let title = null;
    let image = null;

    title = data.title || data['og:title'] || data['twitter:title'];
    description = data.description || data['og:description'] || data['twitter:description'];
    image = data['og:image'] || data['twitter:image'] || data.image;

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
