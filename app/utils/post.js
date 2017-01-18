const cheerio = require('cheerio-without-node-native');

function extractDomain(url) {
  let domain;
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  domain = domain.split(':')[0];

  let noPrefix = domain;

  if (domain.indexOf('www.') > -1) {
    noPrefix = domain.replace('www.', '');
  }
  return noPrefix;
}

export function generatePreview(link) {
  let responseUrl;
  return fetch(link, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
    }
  })
  .then((response) => {
    responseUrl = response.url;
    return response.text();
  })
  .then((responseTxt) => {
    const $ = cheerio.load(responseTxt);

    let canonical = $("link[rel='canonical']");
    if (canonical && canonical.attribs) canonical = canonical.attribs;
    else canonical = null;

    if (canonical && extractDomain(canonical.href) !== extractDomain(link)) {
      return generatePreview(canonical.href);
    }

    let data = {
      title: null,
      description: null,
      image: null,
      'og:type': null,
      'og:title': null,
      'og:description': null,
      'og:image': null,
      'og:image:url': null,
      'twitter:title': null,
      'twitter:image': null,
      'twitter:image:src': null,
      'twitter:description': null,
      'twitter:site': null,
      'twitter:creator': null,
    };
    const meta = $('meta');
    const $title = $('title');
    const keys = Object.keys(meta);

    let titleEl = $title.eq(0).text();

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

    title = titleEl || data.title || data['og:title'] || data['twitter:title'];
    description = data.description || data['og:description'] || data['twitter:description'];
    image = data['og:image'] || data['og:image:url'] || data['twitter:image'] || data['og:image:src'] || data.image;

    if (image && image.match(/^\/\//)) {
      image = image.replace(/^\/\//, '');
    }

    const obj = {
      image,
      description,
      title,
      link
    };

    if (!image || !description || !title) {
      console.log('url parse error');
      console.log(data);
    }

    return obj;
  })
  .catch((error) => {
    console.log(error, 'error');
    return false;
  });
}
