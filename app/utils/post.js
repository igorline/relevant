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

function getYoutubeLink(link) {
  let videoId = link.split('v=')[1];
  let ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }

  // TODO should go in publicenv.js
  let apiKey = '***REMOVED***';
  let apiUrl = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=' + apiKey;

  return fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    }
  })
  .then((response) => {
    return response.json();
  })
  .then((responseJSON) => {
    let image = null;
    let description = null;
    let title = null;
    let videoInfo = null;

    if (responseJSON.items) {
      if (responseJSON.items[0]) {
        if (responseJSON.items[0].snippet) {
          videoInfo = responseJSON.items[0].snippet;
          if (videoInfo.title) title = videoInfo.title;
          if (videoInfo.thumbnails) image = videoInfo.thumbnails.high.url;
          if (videoInfo.description) description = videoInfo.description;
        }
      }
    }

    let obj = {
      image,
      description,
      title,
      domain: extractDomain(link),
      url: link
    };

    return obj;
  })
  .catch((error) => {
    console.log(error, 'error');
    return false;
  });
}


export function generatePreview(link) {
  console.log('fetching ', link);
  let responseUrl;
  let fbHeader = {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Content-Type': 'application/x-www-form-urlencoded;charset=ISO-8859-15'
  };

  if (!link.match(/http:\/\//i) && !link.match(/https:\/\//i)) {
    link = 'http://' + link;
  }

  // Handle youtube
  if (link.indexOf('youtube') > -1) {
    return getYoutubeLink(link);
  }

  return fetch(link, {
    method: 'GET',
    headers: link.match('apple.news') ? {} : fbHeader
  })
  .then((response) => {
    responseUrl = response.url;
    return response.text();
  })
  .then((responseTxt) => {
    const $ = cheerio.load(responseTxt);

    let redirect = $("meta[http-equiv='refresh']")[0];
    let redirectUrl;

    if (redirect && redirect.attribs && redirect.attribs.content) {
      redirectUrl = redirect.attribs.content.split('URL=')[1];
    }
    if (redirectUrl) return generatePreview(redirectUrl);

    let canonical = $("link[rel='canonical']")[0];
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
      'og:url': null,
      'al:web:url': null,
      'twitter:title': null,
      'twitter:image': null,
      'twitter:image:src': null,
      'twitter:description': null,
      'twitter:site': null,
      'twitter:creator': null,
      'news_keywords': null,
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

    let title = data.title || data['og:title'] || data['twitter:title'] || titleEl;
    let description = data.description || data['og:description'] || data['twitter:description'];
    let image = data['og:image'] || data['og:image:url'] || data['twitter:image'] || data['og:image:src'] || data.image;
    let url = data['al:web:url'] || data['og:url'] || responseUrl;
    let tags = data['news_keywords'];
    let domain = extractDomain(url);

    if (image && image.match(/^\/\//)) {
      image = image.replace(/^\/\//, '');
    }

    let obj = {
      image,
      description,
      title,
      url,
      domain,
      tags
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
