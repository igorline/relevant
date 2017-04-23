import request from 'request-promise-any';
import jsdom from 'jsdom';
import Readability from 'readability';
import cheerio from 'cheerio';

let fbHeader = {
  'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
};


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

exports.getReadable = async (uri) => {
  let article;
  try {
    let body = await request({
      url: uri,
      jar: true,
      headers: fbHeader
    });

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

exports.generatePreview = (body, uri) => {
  console.log('Generate Preview ', uri);

  const $ = cheerio.load(body);

  let redirect = $("meta[http-equiv='refresh']")[0];
  let redirectUrl;

  if (redirect && redirect.attribs && redirect.attribs.content) {
    redirectUrl = redirect.attribs.content.split('URL=')[1];
    if (uri.match('twitter.com') && redirectUrl.match('mobile.twitter.com')) {
      redirectUrl = uri;
    }
  }
  if (redirectUrl &&
    exports.extractDomain(redirectUrl) !== exports.extractDomain(uri)) {
    return {
      redirect: true,
      uri: redirectUrl
    };
  }

  let canonical = $("link[rel='canonical']")[0];
  if (canonical && canonical.attribs) canonical = canonical.attribs;
  else canonical = null;

  if (canonical &&
    canonical.href &&
    exports.extractDomain(canonical.href) !== exports.extractDomain(uri)) {
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
  };
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
        data[s] = meta[key].attribs.content;
      }
    });
  });

  if (data.image && data.image.indexOf('http://') !== 0 &&
      data.image.indexOf('https://') !== 0) {
    data.image = uri + data.image;
  }

  let description = null;
  let title = null;
  let image = null;

  title = data['og:title'] || data['twitter:title'] || data.title;
  description = data.description || data['og:description'] || data['twitter:description'];
  image = data['og:image'] || data['og:image:url'] || data['twitter:image'] || data['twitter:image:src'] || data.image;
  let url = data['al:web:url'] || data['og:url'] || uri;
  let tags = data.news_keywords || data.keywords;
  let domain = exports.extractDomain(url);

  let doc = jsdom.jsdom(body, {
    features: {
      FetchExternalResources: false,
      ProcessExternalResources: false
    }
  });

  let article = new Readability(uri, doc).parse();
  let short;
  if (article) {
    short = exports.trimToLength(article.article, 140).innerHTML;
  } else {
    console.log('couldn\'t parse url ', uri);
  }
  // console.log('author ', article.byline);
  if (!image && article && article.content) {
    image = article.content.match(/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/);
    image = image ? image[0] : null;
    console.log('found image ', image);
  } else if (!image) {
    image = $('img').eq(0).attr('src');
    console.log('found alt image', image);
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
    articleAuthor: article && article.byline ? [article.byline] : null
  };

  if (!image || !description || !title) {
    console.log('url parse error');
    console.log(data);
    console.log(uri);
    console.log($('head').html());
  }

  // console.log(obj);
  // console.log($('head').html());
  // console.log(body);

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
