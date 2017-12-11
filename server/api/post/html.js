import request from 'request-promise-any';
import jsdom from 'jsdom';
import { JSDOMParser, Readability } from 'readability/index';
import cheerio from 'cheerio';
import { parse as parseUrl } from 'url';

let fbHeader = {
  'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
};

const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+~#?&//=]*)/);
const HTML_REGEX = new RegExp(/<[^>]*>/, 'gm');

exports.extractDomain = (url) => {
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
};

function stripHTML(text) {
  return (text || '').replace(HTML_REGEX, '');
}

exports.getReadable = async (uri) => {
  let article;
  try {
    let body = await request({
      url: uri,
      jar: true,
      headers: fbHeader
    });

    // let doc = new JSDOMParser().parse(body);

    let doc = jsdom.jsdom(body, {
      features: {
        FetchExternalResources: false,
        ProcessExternalResources: false
      }
    });
    article = new Readability(uri, doc).parse();
    if (!article) throw new Error('Couldn\'t parse doc');
    // console.log(article.byline);
  } catch (err) {
    console.log('ERROR getting readable version', uri);
    throw err;
  }
  return article;
};

exports.trimToLength = (doc, length) => {
  Array.prototype.slice.call(doc.getElementsByTagName('figure'))
  .forEach(item => item.remove());

  let totalLength = 0;
  Array.prototype.slice.call(doc.getElementsByTagName('*'))
  .forEach(el => {
    if (totalLength > length) return el.remove();
    let elChildNode = el.childNodes;
    elChildNode.forEach(child => {
      if (child.nodeType === 3) {
        let text = child.textContent;
        let l = text.split(/\s+/).length;
        if (l > 4) totalLength += l;
      }
    });
    return null;
  });
  return doc;
};

exports.generatePreview = async (body, uri, reqUrl) => {
  // console.log('Generate Preview ', uri);

  body = body.replace('<!--', '').replace('-->', '');
  let $ = cheerio.load(body);

  let redirect = $("meta[http-equiv='refresh']")[0];
  let redirectUrl;

  if (redirect && redirect.attribs && redirect.attribs.content) {
    redirectUrl = redirect.attribs.content.split('URL=')[1];
    if (redirectUrl) redirectUrl = redirectUrl.replace(/\'/g, '');
    if (redirectUrl && uri.match('twitter.com') && redirectUrl.match('mobile.twitter.com')) {
      redirectUrl = uri;
    }
  }

  if (redirectUrl &&
    exports.extractDomain(redirectUrl) !== '' &&
    exports.extractDomain(redirectUrl) !== exports.extractDomain(uri) &&
    reqUrl !== redirectUrl) {
    return {
      redirect: true,
      uri: redirectUrl
    };
  }

  let canonical = $("link[rel='canonical']")[0];
  if (canonical && canonical.attribs) canonical = canonical.attribs;
  else canonical = null;

  if (canonical && canonical.href) {
    // console.log('check if valid canonical url');
    if (!URL_REGEX.test(canonical.href)) {
      canonical.href = exports.extractDomain(uri) + canonical.href;
    }
  }

  // console.log('reqUrl ', reqUrl);
  // console.log('canonical url ', canonical.href);
  // console.log('original url  ', uri);

  if (canonical &&
    canonical.href &&
    exports.extractDomain(canonical.href) !== exports.extractDomain(uri) &&
    reqUrl !== canonical.href) {
    return {
      redirect: true,
      uri: canonical.href
    };
  }

  if (uri.match('apple.news')) {
    try {
      let articleUrl = body.match(/redirectToUrl\("(.*)"/)[0].replace(/redirectToUrl\(|"/g, '');
      if (articleUrl) {
        return {
          redirect: true,
          uri: articleUrl
        };
      }
    } catch (err) {
      console.log(err);
    }
  }

  // console.log(body);

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
    news_keywords: null,
    keywords: null,
    'article:tag': null,
    author: null,
    'article:author': null,
  };
  // ads milti element concotenation
  const miltiElement = [
    'news_keywords',
    'keywords',
    'article:tag',
    'author',
    'article:author'
  ];
  const meta = $('meta');
  const $title = $('title');
  const keys = Object.keys(meta);

  data.title = $title.eq(0).text();

  Object.keys(data).forEach(s => {
    keys.forEach((key) => {
      if (meta[key].attribs
        && (meta[key].attribs.property === s
        || meta[key].attribs.name === s
        || meta[key].attribs.itemprop === s)
      ) {
        if (!data[s]) data[s] = meta[key].attribs.content;
        else if (miltiElement.find(m => m === s)) {
          data[s] += ', ' + meta[key].attribs.content;
        }
      }
    });
  });


  let description = null;
  let title = null;
  let image = null;

  title = data['og:title'] || data['twitter:title'] || data.title;
  description = stripHTML(data.description || data['og:description'] || data['twitter:description']).trim();
  image = data['og:image'] || data['og:image:url'] || data['twitter:image'] || data['twitter:image:src'] || data.image;
  // why prioritise og tags? flipboard?
  let url = data['al:web:url'] || data['og:url'] || uri;
  let tags = data.news_keywords || data.keywords;
  let domain = exports.extractDomain(url);

  let originalUrl = parseUrl(uri);
  let cannonicalUrl = parseUrl(url);

  let k1 = data['keywords'] ? data['keywords'].split(',').map(k => k.trim()) : [];
  let k2 = data['news_keywords'] ? data['news_keywords'].split(',').map(k => k.trim()) : [];
  let k3 = data['article:tag'] ?
  data['article:tag']
  .split(',')
  .map(k => k.replace('--primarykeyword-', '').trim())
  .filter(k => !k.match('--')) : [];

  let keywords = [...new Set([...k1, ...k2, ...k3])];

  // general fix for mismatch
  if (originalUrl.pathname !== cannonicalUrl.pathname) {
    url = originalUrl.protocol + '//' + originalUrl.host + originalUrl.pathname;
  }

  let amp = $('[type="application/ld+json"]').eq(0).text();
  let ampKeywords;
  let ampAuthor;
  if (amp) {
    try {
      amp = amp.replace('//<![CDATA[', '')
      .replace('// <![CDATA[', '')
      .replace('//]]>', '')
      .replace('// ]]>', '')
      .trim();
      amp = JSON.parse(amp);
      if (!amp) throw new Error('no amp');
      ampAuthor = amp.author ? amp.author.name : null;
      ampKeywords = amp.keywords && amp.keywords.length ? amp.keywords : null;
      if (typeof ampAuthor === 'string') ampAuthor = [ampAuthor];
    } catch (err) {
      // console.log(amp);
      // console.log(err);
    }
  }
  // console.log('amp: ', amp ? JSON.parse(amp) : null);

  // console.log('url ', url);
  // console.log('article:author ', data['article:author']);
  // console.log('author ', data['author']);
  // console.log('amp author ', ampAuthor);
  // console.log('regular keywords ', keywords);
  // console.log('amp keywords', ampKeywords);

  data['author'] = data['author'] || '';

  data['article:author'] = data['article:author'] || '';

  let metaAuthor = data['author']
  .split(/,|\sand\s/)
  .map(a => a.trim())
  .filter(a => a !== '');

  ampAuthor = ampAuthor || [];


  let author = [...ampAuthor, ...metaAuthor];
  author = [...new Set(author)].filter(a => !a.match('http'));


  if (ampKeywords && ampKeywords.length && !keywords.length) {
    if (typeof keywords !== 'array') {

    } else {
      keywords = ampKeywords.filter(k => !k.match('@'));
    }
  }

  keywords = keywords.map(k => k.toLowerCase());
  keywords = [...new Set(keywords)];

  // console.log(keywords);

  if (!data['author'] && ampAuthor) {
    // console.log('AMP AUTHOR');
    // console.log(ampAuthor);
  }

  let doc = jsdom.jsdom(body, {
    features: {
      FetchExternalResources: false,
      ProcessExternalResources: false
    }
  });

  let article;

  try {
    article = new Readability(url, doc).parse();
  } catch (err) {
    console.log('Readability ERR ', err);
  }

  let short;
  if (article && article.article) {
    try {
      short = article.excerpt || exports.trimToLength(article.article, 140).innerHTML;
    } catch (err) {
      console.log(err);
    }
    if (!author.length && article.byline) {
      let by = article.byline.split(/\n|\,|•/)
      .map(a => a.replace(/by|by:\s/i, '').trim())
      .filter(a => a !== '' &&
        !a.match(/^by$/i) &&
        a.length > 2 &&
        !a.match('UTC')
        && (isNaN(new Date(a).getTime()))
        && !a.match('http')
        //&& !a.match(/2017|2016|2015|2018/)
      );
      // .map(a => new Date(a))
      // console.log(by);
      author = by[0] ? [by[0]] : [];
    }
  } else {
    // console.log('couldn\'t parse url ', url);
  }

  // console.log('author ', article.byline);

  // if (!image && article && article.content) {
  //   image = article.content.match(/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/);
  //   image = image ? image[0] : null;
  //   console.log('found image ', image);
  // } else if (!image) {
  //   image = $('img').eq(0).attr('src');
  //   console.log('found alt image', image);
  // }


  if (image && image.indexOf('http://') !== 0 &&
      image.indexOf('https://') !== 0) {
    image = 'http://' + domain + image;
  }


  if (!title && url.match('.pdf')) {
    title = url.substring(url.lastIndexOf('/') + 1);
  }

  const obj = {
    image,
    description,
    title,
    url,
    domain,
    tags,
    shortText: short,
    articleAuthor: author || null,
    keywords
  };

  if (!image || !title) {
    console.log('url parse incomplete');
    // console.log(data);
    // console.log(uri);
    // console.log($('head').html());
  }

  // console.log(obj);
  // console.log($('head').html());
  // console.log(body);
  $ = null;
  body = null;

  return {
    redirect: false,
    result: obj
  };
};

  // method 1
  // let req = http.request(previewUrl, function(res) {
  //   response.writeHead(res.statusCode, res.headers);
  //   return res.pipe(response, { end: true });
  // });
  // request.pipe(req, { end: true });


  // method 2
  // request.pause();
  // var options = url.parse(request.url);
  // options.headers = request.headers;
  // options.method = request.method;
  // options.agent = false;
  // var connector = http.request(previewUrl, function(serverResponse) {
  //   serverResponse.pause();
  //   response.writeHeader(serverResponse.statusCode, serverResponse.headers);
  //   serverResponse.pipe(response);
  //   serverResponse.resume();
  // });
  // request.pipe(connector);
  // request.resume();


  // method 3
  // let proxy = http.createClient(80, request.headers['host'])
  // let proxy_request = proxy.request(request.method, request.params.url, request.headers);
  // proxy_request.on('response', function (proxy_response) {
  //   proxy_response.pipe(response);
  //   response.writeHead(proxy_response.statusCode, proxy_response.headers);
  // });

  // response.pipe(proxy_request);
