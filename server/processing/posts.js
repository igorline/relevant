import { promisify } from 'util';
import request from 'request';
import queue from 'queue';
import Meta from '../api/metaPost/metaPost.model';
import Post from '../api/post/post.model';
import * as proxyHelpers from '../api/post/html';

let requestAsync = promisify(request);

let q = queue({
  concurrency: 20,
});

q.on('timeout', (next, job) => {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});



async function populateMeta() {
  // let fbHeader = {
  //   'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  // };
  try {
    let all = await Meta.find({ url: { $ne: null } });
    all.forEach(meta => {
      q.push(async cb => {
        try {
          // let resonse = await request({
          //   url: meta.url,
          //   maxRedirects: 20,
          //   jar: true,
          //   // headers: meta.url.match('apple.news') ? {} : fbHeader
          // });
          // if (!resonse) throw new Error('problem getting url');
          // if (!url.match('http://') && !url.match('https://')) {
          //   url = 'http://';
          // }

          let url = meta.url;

          // console.log('url: ', url);
          let article = await proxyHelpers.getReadable(url);
          let short = proxyHelpers.trimToLength(article.article, 140);
          meta.shortText = short.innerHTML;
          meta.articleAuthor = article.byline;
          console.log('author ', meta.shortText.length);
          // meta.url = url;

          // meta.domain = extractDomain(meta.url);
          // let unfluff = extractor(resonse);

          // meta.shortText = unfluff.text.split(/\s+/, 300).join(' ');
          // meta.articleAuthor = unfluff.author;
          // if (unfluff.date) {
          //   let date = Date.parse(unfluff.date);
          //   if (!date) date = Date.parse(unfluff.date.replace(/-500$/, ''));
          //   if (date) meta.articleDate = date;
          //   if (!date) console.log('couldn\'t convert date ', unfluff.date)
          // }
          // meta.publisher = unfluff.publisher;
          // meta.links = unfluff.links;
          // console.log(short);
          meta = await meta.save();

        } catch (err) {
          console.log(err.message);
        }
        cb();
      });
    });
  } catch (err) {
    console.log('populate error ', err);
  }

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('all finished populating meta: ');
  });
}


function getHeader(uri) {
  let fbHeader = {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) Facebot',
  };
  let noFb = uri.match('apple.news'); // || uri.match('flip.it');
  if (noFb) return {};
  return fbHeader;
}

async function updatePostData() {
  try {
    let all = await Post.find({ link: { $ne: null } });
    console.log(all.length);
    all.forEach(post => {
      q.push(async cb => {
        try {
          let result = await requestAsync({
            url: post.link,
            maxRedirects: 22,
            jar: true,
            gzip: true,
            headers: getHeader(post.link),
            rejectUnauthorized: false,
          });
          let data = proxyHelpers.generatePreview(result.body, post.link);
          if (data.result) {
            post.keywords = data.result.keywords;
            post.articleAuthor = data.result.articleAuthor;
          }
          // console.log(post.keywords);
          // console.log(post.articleAuthor);
          await post.save();
          let meta = await post.upsertMetaPost(post.meta);
          console.log(meta.keywords);
        } catch (err) {
          console.log(err);
        }
        cb();
      });
    });
  } catch (err) {
    console.log('populate error ', err);
  }

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('all finished populating posts: ');
  });
}

// populateMeta();
// updatePostData();
