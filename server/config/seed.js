var User = require('../api/user/user.model');
// var Tagparent = require('../api/tagParent/tagParent.model');
var Tag = require('../api/tag/tag.model');
var Subscription = require('../api/subscription/subscription.model');
var Comment = require('../api/comment/comment.model');
var Post = require('../api/post/post.model');
var Notification = require('../api/notification/notification.model');
var Invest = require('../api/invest/invest.model');
var Feed = require('../api/feed/feed.model');
var Statistics = require('../api/statistics/statistics.model');
var Earnings = require('../api/earnings/earnings.model');
var Message = require('../api/message/message.model');
var Relevance = require('../api/relevance/relevance.model');
var Treasury = require('../api/treasury/treasury.model');
var MetaPost = require('../api/metaPost/metaPost.model');


var dummyUsers = [

  {
    "_id": "jay",
    "provider": "local",
    "name": "jay",
    "phone": "734-972-0834",
    "email": "jaygoss@gmail.com",
    "image": "https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif",
    "hashedPassword": "6jT/02o6tOknuyxmUbiIkIdt2BD4FszSgy8ftmsNt/GhDB/6aDFOBOE4mshuuhTTiVsWRdWuHzvOp9u5gTaFag==",
    "salt": "1juLhuAPx0BY9ZrWz2B7Vg==",
    "relevance": 100,
    "balance": 7777,
    "posts": [],
    "invest": [],
    "role": "user",
    "__v": 224,
    "feed": []
  },
  {
    "_id": "test",
    "provider": "local",
    "name": "test",
    "phone": "847-436-5585",
    "email": "test@test.com",
    "image": "https://i1.sndcdn.com/avatars-000012209871-1qw37z-t500x500.jpg",
    "hashedPassword": "DyTMC4msmlo7CBzbFNHGc105N3MRy94Ac+e0o9hAoYQ+nrPsTFqTwAnR3ZYudhpJGgAltUtcfi7QKCNa/GuktA==",
    "salt": "vGcRZeZAMdIvxX8dHbIaNw==",
    "relevance": 100,
    "balance": 7777,
    "posts": [],
    "invest": [],
    "role": "user",
    "__v": 53,
    "feed": []
  },
  {
    "_id": "admin",
    "provider": "local",
    "name": "admin",
    "email": "admin@admin.com",
    "hashedPassword": "FcgEe4l+atBHPkP8GYYOR+U1aPOr2CXVMJb1CYLaAXrGvjSNcgPr5WyCc/R3n5D9QYYzm/ULCXE5xVXYAM1lcA==",
    "salt": "adylOzjZw8fGD+7G3jLLzw==",
    "posts": [],
    "invest": [],
    "role": "admin",
    "__v": 0
}
];

var dummySubscriptions = [
{
    "_id": "572a37d72ae95bf66b3e32d1",
    "updatedAt": "2016-05-16T16:16:21.340Z",
    "createdAt": "2016-05-04T17:56:39.263Z",
    "follower": "5706ef322170009d5be58be4",
    "following": "5706ef322170009d5be58be4",
    "amount": 1,
    "__v": 0
},
{
    "_id": "572a37d72ae95bf66b3e32d2",
    "updatedAt": "2016-05-16T16:16:21.340Z",
    "createdAt": "2016-05-04T17:56:39.263Z",
    "follower": "5706ef322170009d5be58be5",
    "following": "5706ef322170009d5be58be4",
    "amount": 4,
    "__v": 0
},
{
    "_id": "572a37d72ae95bf66b3e32da",
    "updatedAt": "2016-05-16T16:16:21.340Z",
    "createdAt": "2016-05-04T17:56:39.263Z",
    "follower": "56fb0f9c5135da5c18752422",
    "following": "5706ef322170009d5be58be4",
    "amount": 4,
    "__v": 0
},
{
    "_id": "572a37d72ae95bf66b3e32dx",
    "updatedAt": "2016-05-16T16:16:21.340Z",
    "createdAt": "2016-05-04T17:56:39.263Z",
    "follower": "5706ef322170009d5be58be4",
    "following": "56fb0f9c5135da5c18752422",
    "amount": 4,
    "__v": 0
}
]

var dummyPosts = [
{
    "_id": "5735fd75bcebaca8eebdf82f",
    "updatedAt": "2016-05-13T21:47:41.665Z",
    "createdAt": "2016-05-13T16:14:45.978Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://mongoosejs.com/docs/populate.html",
    "body": "Xxx",
    "title": null,
    "description": null,
    "image": null,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "572296735a2ef54f8c31bb28"
    ],
    "__v": 3,
    "relevance": 0
},
{
    "_id": "573b9a58db6b0bf169313625",
    "updatedAt": "2016-05-17T22:25:28.817Z",
    "createdAt": "2016-05-17T22:25:28.817Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://www.dazeddigital.com/artsandculture/article/31080/1/sex-roulette-is-the-disturbing-new-trend-for-spanish-teens",
    "body": "Omg",
    "title": "‘Sex roulette’ is the disturbing new trend for Spanish teens",
    "description": "Barcelona has reportedly seen a rise in ‘high-risk’ sex parties, where participants have unprotected sex with HIV carriers",
    "image": "https://relevant-images.s3.amazonaws.com/ei9eiede4_.jpg",
    "rank": 16938.93436130787,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573b9a0ddb6b0bf16931361b",
      "573b9a13db6b0bf16931361c",
       "573b9a1adb6b0bf16931361d",
       "573b9a20db6b0bf16931361e",
        "573b9a13db6b0bf16931361c",
        "573b9a2cdb6b0bf16931361f",
        "573b9a35db6b0bf169313620",
        "573b9a3edb6b0bf169313621",
        "573b9a45db6b0bf169313622",
        "573b9a4bdb6b0bf169313623",
        "573b9a56db6b0bf169313624"
    ],
    "__v": 0
},
{
    "_id": "5734d1be752c857ce06e4dd5",
    "updatedAt": "2016-05-13T22:00:20.352Z",
    "createdAt": "2016-05-12T18:55:58.141Z",
    "user": "5706ef322170009d5be58be4",
    "link": "https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory",
    "body": "Hotties",
    "title": "Three deaths linked to recent Navy SEAL training classes",
    "description": "\"My life won't feel complete unless I do this,\" wrote one Navy SEAL trainee who killed himself in April when he didn't make the cut.",
    "image": "https://relevant-images.s3.amazonaws.com/lxpepcs4r_lias",
    "investments": [
    ],
    "value": 0,
    "tagsString": [],
    "tags": [
       "5734d12b752c857ce06e4dd3"
    ],
    "__v": 2,
    "relevance": 0
},
{
    "_id": "573b64457cd3467d5238c404",
    "updatedAt": "2016-05-17T18:34:45.105Z",
    "createdAt": "2016-05-17T18:34:45.105Z",
    "user": "5706ef322170009d5be58be4",
    "link": "http://www.dazeddigital.com/artsandculture/article/31105/1/talking-to-the-people-that-like-to-be-hypnotised-for-sex",
    "body": "Waow",
    "title": "Talking to people that like to be hypnotised for sex",
    "description": "Here we find out more about trance-sexuality, the practice of being put under a spell in the bedroom",
    "image": "https://relevant-images.s3.amazonaws.com/4uzrca7de_.gif",
    "rank": 16938.77413315972,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573b64407cd3467d5238c403"
    ],
    "__v": 0
},
{
    "_id": "573b9791db6b0bf16931361a",
    "updatedAt": "2016-05-17T22:13:37.600Z",
    "createdAt": "2016-05-17T22:13:37.600Z",
    "user": "5706ef322170009d5be58be4",
    "link": "http://www.dazeddigital.com/artsandculture/article/31140/1/google-ai-is-really-good-at-writing-emo-poetry",
    "body": "Google AI",
    "title": "Google AI is really good at writing emo poetry",
    "description": "The artificial intelligence project was fed over 11,000 unpublished novels to create its own works",
    "image": "https://relevant-images.s3.amazonaws.com/spr82tgc7_.gif",
    "rank": 16938.926129629628,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573b8851695a1d1a6238adcc",
        "573b64407cd3467d5238c403"
    ],
    "__v": 0
},
{
    "_id": "573ca5b346bab4857c940d91",
    "updatedAt": "2016-05-18T17:26:11.750Z",
    "createdAt": "2016-05-18T17:26:11.750Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://www.dazeddigital.com/artsandculture/article/31176/1/chloe-sevigny-opens-up-about-creepy-directors",
    "body": "Yo",
    "title": "Chloë Sevigny opens up about ‘creepy’ audition experiences",
    "description": "The actress was apparently urged by one director to show her body off before she got ‘too old’\n",
    "image": "https://relevant-images.s3.amazonaws.com/exwn9irfi_.jpg",
    "rank": 16939.72652488426,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "57225b3f50f16c0277c71c5e"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cb74ad202486288bfa264",
    "updatedAt": "2016-05-18T18:41:14.114Z",
    "createdAt": "2016-05-18T18:41:14.114Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "https://itunes.apple.com/us/app/playboy-now/id930678202?mt=8",
    "body": "Waow",
    "title": "Playboy NOW on the App Store",
    "description": "Read reviews, compare customer ratings, see screenshots, and learn more about Playboy NOW. Download Playboy NOW and enjoy it on your iPhone, iPad, and iPod touch.",
    "image": "https://relevant-images.s3.amazonaws.com/jj9e5ynyt_.jpg",
    "rank": 16939.778635578703,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573cb745d202486288bfa263"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cb776d202486288bfa267",
    "updatedAt": "2016-05-18T18:41:58.551Z",
    "createdAt": "2016-05-18T18:41:58.551Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://www.onthisday.com/day/may/19",
    "body": "U betta",
    "title": "May 19th: On This Day in History",
    "description": "What historical events happened, which famous people were born and who died on May 19th.",
    "image": "https://relevant-images.s3.amazonaws.com/miuci4heo_.jpg",
    "rank": 16939.779149895832,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573cb771d202486288bfa266"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cbaef5896ba8c893fd25f",
    "updatedAt": "2016-05-18T18:56:47.254Z",
    "createdAt": "2016-05-18T18:56:47.254Z",
    "user": "5706ef322170009d5be58be4",
    "link": "http://www.dazeddigital.com/music/article/31173/1/watch-a-trippy-new-video-by-beyond-the-wizard-s-sleeve",
    "body": "Whatev",
    "title": "Watch a trippy new video by Beyond The Wizard’s Sleeve",
    "description": "BAFTA-winning director Kieran Evans shoots a set of dance routines that can be performed both backwards and forwards for Erol Alkan and Richard Norris’ psych pop project",
    "image": "https://relevant-images.s3.amazonaws.com/mnp7e4oyh_.jpg",
    "rank": 16939.789435810184,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "57225b3f50f16c0277c71c5e"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cbb3c5896ba8c893fd261",
    "updatedAt": "2016-05-18T18:58:04.128Z",
    "createdAt": "2016-05-18T18:58:04.128Z",
    "user": "5706ef322170009d5be58be4",
    "link": "http://www.dazeddigital.com/music/article/31180/1/die-antwoord-enlist-dita-von-teese-for-gucci-coochie",
    "body": "K",
    "title": "Die Antwoord enlist Dita Von Teese for ‘Gucci Coochie’",
    "description": "The model and burlesque dancer appears on the latest song to surface from the South African’s new mixtape Suck On This",
    "image": "https://relevant-images.s3.amazonaws.com/9ig909itj_.jpg",
    "rank": 16939.790325555554,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "57225b3f50f16c0277c71c5e"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cbb995896ba8c893fd262",
    "updatedAt": "2016-05-18T18:59:37.067Z",
    "createdAt": "2016-05-18T18:59:37.067Z",
    "user": "5706ef322170009d5be58be4",
    "link": "http://www.dazeddigital.com/music/article/31148/1/80-year-old-couple-go-to-fabric-drink-tea-until-5am",
    "body": "S",
    "title": "80-year-old couple go to Fabric, drink tea until 5am",
    "description": "The pair came to check out the London club’s techno night, ‘WetYourSelf’",
    "image": "https://relevant-images.s3.amazonaws.com/2y6zhtqgj_.jpg",
    "rank": 16939.791401238424,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "57239c52f3eea040a87177c8"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cc3481ce5bf8f8b5808de",
    "updatedAt": "2016-05-18T19:32:24.613Z",
    "createdAt": "2016-05-18T19:32:24.613Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://www.dazeddigital.com/artsandculture/article/31167/1/see-hundreds-of-yakuza-strip-outside-a-police-station",
    "body": "Yas",
    "title": "See the Japanese mafia strip outside a police station",
    "description": "In a display of power and strength, the yakuza showed off their full-body tattoos and carried a one tonne shrine through the streets",
    "image": "https://relevant-images.s3.amazonaws.com/pskrq9gcy_.JPG",
    "rank": 16939.814173761573,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "5734d12b752c857ce06e4dd3"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cc3811ce5bf8f8b5808e1",
    "updatedAt": "2016-05-18T19:33:21.238Z",
    "createdAt": "2016-05-18T19:33:21.238Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://www.dazeddigital.com/fashion/article/31158/1/inside-the-new-book-paying-homage-to-issey-miyake",
    "body": "Whatever",
    "title": "Inside the new book paying homage to Issey Miyake",
    "description": "To coincide with the designer’s new Tokyo retrospective, a Taschen photobook charts some of his most iconic moments",
    "image": "https://relevant-images.s3.amazonaws.com/i7kdcdbs6_.jpg",
    "rank": 16939.814829143517,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573cc37e1ce5bf8f8b5808e0"
    ],
    "relevance": 0,
    "__v": 0
},
{
    "_id": "573cc3951ce5bf8f8b5808e3",
    "updatedAt": "2016-05-18T19:33:41.820Z",
    "createdAt": "2016-05-18T19:33:41.820Z",
    "user": "56fb0f9c5135da5c18752422",
    "link": "http://www.dazeddigital.com/fashion/article/29468/1/new-exhibition-to-unravel-game-changing-work-of-balenciaga",
    "body": "Whatever",
    "title": "New exhibition to unravel game-changing work of Balenciaga",
    "description": "The Spanish couturier revolutionised fashion, as this show celebrating his eponymous house, ancestors and legacy will reveal",
    "image": "https://relevant-images.s3.amazonaws.com/6z75zikvu_.jpg",
    "rank": 16939.815067361113,
    "investments": [],
    "value": 0,
    "tagsString": [],
    "tags": [
        "573cc37e1ce5bf8f8b5808e0"
    ],
    "relevance": 0,
    "__v": 0
}
]

var dummyFeeds = [
{
    "_id": "573cc3481ce5bf8f8b5808df",
    "updatedAt": "2016-05-18T19:32:24.884Z",
    "createdAt": "2016-05-18T19:32:24.884Z",
    "userId": "5706ef322170009d5be58be4",
    "post": "573cc3481ce5bf8f8b5808de",
    "tags": [
        "5734d12b752c857ce06e4dd3"
    ],
    "__v": 0
},
{
    "_id": "573cc3811ce5bf8f8b5808e2",
    "updatedAt": "2016-05-18T19:33:21.289Z",
    "createdAt": "2016-05-18T19:33:21.289Z",
    "userId": "5706ef322170009d5be58be4",
    "post": "573cc3811ce5bf8f8b5808e1",
    "tags": [
        "573cc37e1ce5bf8f8b5808e0"
    ],
    "__v": 0
},
{
    "_id": "573cc3961ce5bf8f8b5808e4",
    "updatedAt": "2016-05-18T19:33:42.304Z",
    "createdAt": "2016-05-18T19:33:42.304Z",
    "userId": "5706ef322170009d5be58be4",
    "post": "573cc3951ce5bf8f8b5808e3",
    "tags": [
        "573cc37e1ce5bf8f8b5808e0"
    ],
    "__v": 0
}
]

// Subscription.find({}).remove(() => {
//   // Subscription.create(dummySubscriptions, function() {
//   //   console.log('finished populating subscriptions');
//   // });
// });

// Comment.find({}).remove(() => {
//   // Subscription.create(dummySubscriptions, function() {
//   //   console.log('finished populating subscriptions');
//   // });
// });

// Post.find({}).remove(() => {
//   // Post.create(dummyPosts, function( {
//   //   console.log('finished populating posts';
//   // };
// });

// Feed.find({}).remove(() => {
//   // Post.create(dummyFeeds, function( {
//   //   console.log('finished populating feeds';
//   // };
// });

let categories = [
  {"emoji":"📣","name":"Activism"},
  {"emoji":"🐻","name":"Animals"},
  {"emoji":"🏢","name":"Architecture"},
  {"emoji":"🎨 ","name":"Art and Design"},
  {"emoji":"🌐","name":"Business"},
  {"emoji":"💻","name":"Computer Science"},
  {"emoji":"🗿","name":"Culture"},
  {"emoji":"📰 ","name":"Current Events"},
  {"emoji":"🎭","name":"Entertainment"},
  {"emoji":"✌🏽️","name":"Fashion"},
  {"emoji":"🍴","name":"Food and Drink"},
  {"emoji":"🚴 ","name":"Health and Fitness"},
  {"emoji":"✒️","name":"Journalism"},
  {"emoji":"🌈","name":"LGBT"},
  {"emoji":"😂","name":"LOL"},
  {"emoji":"🎶","name":"Music"},
  {"emoji":"🌍 ","name":"Nature and Environment"},
  {"emoji":"🌀","name":"Other"},
  {"emoji":"✅","name":"Politics"},
  {"emoji":"💕","name":"Relationships"},
  {"emoji":"🔬","name":"Science"},
  {"emoji":"💋","name":"Sex"},
  {"emoji":"⚽","name":"Sports"},
  {"emoji":"📱","name":"Technology"},
  {"emoji":"✈️","name":"Travel"}
];

function populateCats () {
  categories.forEach((cat) => {
    let tagObj = {
      _id: cat.name + '_category_tag',
      categoryName: cat.name,
      emoji: cat.emoji,
      category: true
    };
    Tag.findOneAndUpdate({ _id: tagObj._id }, tagObj, { upsert: true })
    .exec();
  });
}
// Tag.find({}).remove(() => populateCats());
populateCats();

function clearAll() {
  Comment.find({}).remove().exec();
  Earnings.find({}).remove().exec();
  Feed.find({}).remove().exec();
  Invest.find({}).remove().exec();
  Message.find({}).remove().exec();
  MetaPost.find({}).remove().exec();
  Notification.find({}).remove().exec();
  Post.find({}).remove().exec();
  Relevance.find({}).remove().exec();
  Statistics.find({}).remove().exec();
  Subscription.find({}).remove().exec();
  // Tag.find({}).remove().exec();
  populateCats();
  Treasury.find({}).remove().exec();
  User.find({}).remove(() => {
    User.create(dummyUsers, () => {
      console.log('finished populating users');
    });
  });
  console.log('finished clearing all data');
}

// clearAll();

