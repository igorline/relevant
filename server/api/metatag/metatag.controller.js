'use strict';

// var superagent = require('superagent');
// var cheerio = require('cheerio');
// var FormData = require('form-data');
// var request = require('request');

// exports.get = function(req, res) {
//   console.log(req.query, 'req.query');

//   new Promise((resolve, reject) => {
//     superagent.get(req.query.url)
//       .end(function(err, res) {
//         if (err) return reject(err);
//         var $ = cheerio.load(res.text);
//         var data = {
//           'og:type': null,
//           'og:title': null,
//           'og:description': null,
//           'og:image': null,
//           'twitter:title': null,
//           'twitter:image': null,
//           'twitter:description': null,
//           'twitter:site': null,
//           'twitter:creator': null,
//         }
//         var meta = $('meta');
//         var keys = Object.keys(meta);
//         for (var s in data) {
//           keys.forEach(function(key) {
//             if (meta[key].attribs &&
//               meta[key].attribs.property &&
//               meta[key].attribs.property === s) {
//               data[s] = meta[key].attribs.content;
//             }
//           })
//         }
//         var description = null;
//         var title = null;
//         var image = null;

//         if (data['og:title']) {
//           title = data['og:title'];
//         } else if (data['twitter:title']) {
//           title = data['twitter:title'];
//         }

//         if (data['og:description']) {
//           description = data['og:description'];
//         } else if (data['twitter:description']) {
//           description = data['twitter:description'];
//         }

//         if (data['og:image']) {
//           image = data['og:image'];
//         } else if (data['twitter:image']) {
//           image = data['twitter:image'];
//         }

//         var metaTags = {
//           'description': description,
//           'title': title,
//           'image': image
//         }



//           // downloadImage(metaTags.image).then(function(url) {
//           //   metaTags.image = url;
//           //   resolve(metaTags);
//           // }, function(err) {
//           //   console.log(err);
//           // });
//           resolve(metaTags);

//       });
//     }).then(function(metaTags) {
//       res.json(200, metaTags);
//     }, function(err) {
//       res.json(500, err)
//     });
// };

// function downloadImage(url) {
//   return new Promise((resolve, reject) => {
//     superagent
//       .get(url)
//       .end(function(err, res) {
//         if (err) reject(err);
//         console.log(res.body, 'image');
//         resolve(res.body);
//       });
//   });
// }

// function prepS3FileName(fileName) {
//   var extension = fileName.substr(fileName.length - 4);
//   var s3FileName = Math.random().toString(36).substr(2, 9) + "_" + extension;
//   return s3FileName;
// }

// function addImage(imageURL, buffer) {
//   var s3FileName = prepS3FileName(imageURL);
//   console.log(s3FileName, 's3filename')
//   return new Promise((resolve, reject) => {
//     superagent
//       .get('http://localhost:3000/api/s3/sign?s3_object_type=multipart/FormData&s3_object_name=' + s3FileName)
//       .end(function(err, res) {
//         if (err) {
//           console.log(err);
//           reject(err);
//         } else {


//         res = JSON.parse(res.text);
//         var body = new FormData();

//         body.append("key", s3FileName);
//         body.append("AWSAccessKeyId", "AKIAIN6YT3LQ4EMODDQA");
//         body.append('acl', 'public-read');
//         body.append("success_action_status", "201");
//         body.append('Content-Type', 'mimeType');
//         body.append('policy', res.signature.s3Policy);
//         body.append('signature', res.signature.s3Signature);
//         body.append('file', buffer);
//         var url = res.url;
//         var publicUrl = res.publicUrl;
//         console.log(publicUrl, 'publicurl')
//         superagent
//           .post(url)
//           .send(body)
//           .end(function(err, res) {
//             if (err) reject(err);
//             resolve(publicUrl);
//           });
//         }
//       });
//   });
// }
