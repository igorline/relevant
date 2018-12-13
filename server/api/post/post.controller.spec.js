

import '../../../mocha.conf.js';
import request from 'supertest-as-promised';

const app = require('../../server');

const mongoose = require('mongoose');

let newThing;

describe('Thing API:', function () {
  let token;

  this.timeout(5000);

  before(function (done) {
    this.timeout(10000);
    if (mongoose.connection.readyState == 1) return done();
    mongoose.connection.on('open', (ref) => {
      console.log('DB CONNECTION OPENED');
      done();
    });
  });

  describe('GET /api/post', () => {
    let things;
    beforeEach((done) => {
      request(app)
        .get('/api/post')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          things = res.body;
          done();
        });
    });

    it('should respond with JSON array', () => {
      expect(things).to.be.instanceOf(Object);
    });
  });

  describe('Create post when not logged in', () => {
    let things;
    beforeEach((done) => {
      request(app)
        .post('/api/post/create')
        .expect(401)
        // .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          things = res.ok;
          done();
        });
    });
    it('should respond with JSON array', () => {
      expect(things).to.be.false;
    });
  });


  const agent = request(app);

  const post = {
    link: 'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
    body: 'Hotties',
    title: 'Test post title',
    description: 'Test post description',
    image: 'https://relevant-images.s3.amazonaws.com/lxpepcs4r_lias',
    investments: [],
    tagsString: [],
    tags: [],
  };
  let postResponse;

  describe('POST /api/post/create', () => {
    beforeEach((done) => {
      agent.post('/auth/local')
        .send({ email: 'test@test.com', password: 'test' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          token = res.body.token;
          agent.post('/api/post/create?access_token=' + token)
            .send(post)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((errX, resX) => {
              if (errX) return done(errX);
              postResponse = resX.body;
              done();
            });
        });
    });

    it('should respond with JSON Object', () => {
      expect(postResponse).to.be.instanceOf(Object);
    });
    it('should not set rank, relevance or value', () => {
      expect(postResponse.value).to.equal(0);
      expect(postResponse.relevance).to.equal(0);
    });
  });


  describe('Check feed for subscriptions /api/feed/test', () => {
    let error = null;
    let feed;
    beforeEach((done) => {
      // var agent = request(app)
      agent.get('/api/feed/test?access_token=' + token)
        // .send({access_token:token})
        .expect(200)
        .end((err, res) => {
          error = err;
          if (err) return done(err);
          feed = res.body;
          console.log('FEED', feed);
          console.log(feed.length);
          done();
        });
    });
    it('should have 3 subscriptions', () => {
      expect(feed).to.be.instanceOf(Array);
      const length = feed.length;
      expect(length).to.equal(3);
    });
  });


  // DELETE The test post
  describe('DELETE /api/post', () => {
    let error = null;
    beforeEach((done) => {
      // var agent = request(app)
      agent.delete('/api/post/' + postResponse._id + '?access_token=' + token)
        // .send({access_token:token})
        .expect(204)
        .end((err, res) => {
          error = err;
          if (err) return done(err);
          done();
        });
    });
    it('should delete post', () => {
      expect(error).to.equal(null);
    });
  });
});

