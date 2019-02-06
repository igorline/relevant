import * as api from './api';

api.env();
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
  const ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }

  // TODO should go in publicenv.js
  const apiKey = '***REMOVED***';
  const apiUrl =
    'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' +
    videoId +
    '&key=' +
    apiKey;

  return fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent':
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    }
  })
  .then(response => response.json())
  .then(responseJSON => {
    let image = null;
    let description = null;
    let title = null;
    let videoInfo = null;

    if (responseJSON.items && responseJSON.items[0] && responseJSON.items[0].snippet) {
      videoInfo = responseJSON.items[0].snippet || {};
      title = videoInfo.title;
      image = videoInfo.thumbnails.high.url;
      description = videoInfo.description;
    }

    const obj = {
      image,
      description,
      title,
      domain: extractDomain(link),
      url: link
    };

    return obj;
  })
  .catch(false);
}

export const URL_REGEX = new RegExp(
  // eslint-disable-next-line
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+~#?&//=]*)/
);

export function generatePreview(link) {
  let responseUrl;
  const fbHeader = {
    'User-Agent':
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
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
  .then(response => {
    responseUrl = response.url;
    return response.text();
  })
  .then(responseTxt => {
    const $ = cheerio.load(responseTxt);

    const redirect = $("meta[http-equiv='refresh']")[0];
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

    const data = {
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
      news_keywords: null,
      keywords: null
    };
    const meta = $('meta');
    const $title = $('title');
    const keys = Object.keys(meta);

    const titleEl = $title.eq(0).text();

    Object(data).keys(k => {
      keys.forEach(key => {
        if (
          meta[key].attribs &&
            (meta[key].attribs.property === k ||
              meta[key].attribs.name === k ||
              meta[key].attribs.itemprop === k)
        ) {
          data[k] = meta[key].attribs.content;
        }
      });
    });

    if (
      data.image &&
        data.image.indexOf('http://') !== 0 &&
        data.image.indexOf('https://') !== 0
    ) {
      data.image = responseUrl + data.image;
    }

    const title = data.title || data['og:title'] || data['twitter:title'] || titleEl;
    const description =
        data.description || data['og:description'] || data['twitter:description'];
    let image =
        data['og:image'] ||
        data['og:image:url'] ||
        data['twitter:image'] ||
        data['og:image:src'] ||
        data.image;
    const url = data['al:web:url'] || data['og:url'] || responseUrl;
    const tags = data.news_keywords;
    const domain = extractDomain(url);

    if (image && image.match(/^\/\//)) {
      image = image.replace(/^\/\//, '');
    }

    const obj = {
      image,
      description,
      title,
      url,
      domain,
      tags
    };

    return obj;
  })
  .catch(false);
}

// TODO update to use api util
export function generatePreviewServer(link) {
  return fetch(
    process.env.API_SERVER + '/api/post/preview/generate?url=' + encodeURIComponent(link),
    { method: 'GET' }
  )
  .then(response =>
  // console.log(response, 'response');
    response.json()
  )
  .then(
    responseJSON =>
    // console.log(responseJSON, 'responseJSON');
      responseJSON
  )
  .catch(false);
}

export function computePayout(postData, community) {
  if (!community || !postData || postData.parentPost) return null;
  postData.payoutShare = postData.pagerank / (community.topPostShares || 1);
  postData.payout = community.rewardFund * postData.payoutShare;
  return postData.payout / 10 ** 18;
}
