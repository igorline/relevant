import React from 'react';

let styles;

export default function Component() {
  return (
    <container style={styles.faq}>
      <h1>FAQ</h1>

      <h3>How is relevant different from other social platforms?</h3>
      <p style={styles.p}>
      Instead of relying on quantity (# of likes, followers etc), Relevant algorithm relies on a quality metric - relevance score. This penalises clickbait and fake news while promoting useful and reliable information.
      </p>

      <h3>What is a ‘relevance score’?</h3>
      <p style={styles.p}>
      Both users and posts have a relevance score. Relevance is how we measure quality. For posts, instead of only counting upvotes, we consider the ‘quality’ of those upvotes (based on the voter's relevance score). Users with high relevance scores are considered experts and their opinion matters more.
      </p>

      <h3>How do I subscribe to someone?</h3>
      <p style={styles.p}>
      You need to upvote a post to subscribe to someone. When you upvote one post, you subscribe to the next 3 posts from the author and they will show up in your feed. If you don’t upvote any of the following posts, your subscription to that person will expire.
      </p>

      <h3>How is a post's relevance calculated?</h3>
      <p style={styles.p}>
      We weight each upvote and downvote by the users relevance. So when someone very relevant upvotes a post, the score changes dramatically.
      </p>

      <h3>Why do I get more relevance points from some people than others?</h3>
      <p style={styles.p}>
      When someone with more relevance than you upvotes one of your posts, you earn more relevance. If they have less relevance than you, you earn one relevant point.
      </p>

      <h3>My post got 10 Relevant points, but my own relevance only increased by 1 point. Why?</h3>
      <p style={styles.p}>
      We calculate post relevance differently from the way we calculate relevance. If a user that upvotes your post is less relevant than you, you will only receive 1 point (see previous question). When calculating the post’s score, the author’s relevance is not taken into account.
      </p>

      <h3>How do you I share an article directly from Chrome, Safari or another app?</h3>
      <ul>
        <li>Press on the share icon <img alt={'share icon'} style={styles.smallImg} src={'/img/faq/shareIcon.jpg'} /></li>
        <li>Press "More" button <img alt={'share menu'} style={styles.bigImg} src={'/img/faq/share.jpg'} /></li>
        <li>Toggle on Relevant app <img alt={'share toggle'} style={styles.bigImg} src={'/img/faq/toggle.jpg'} /></li>
        <li>Press on Relevant icon <img alt={'share button'} style={styles.bigImg} src={'/img/faq/shareRelevant.jpg'} /></li>
      </ul>
    </container>
  );
}

styles = {
  faq: {
    maxWidth: '800px',
    margin: 'auto',
  },
  p: {
    marginLeft: '0px',
  },
  bigImg: {
    width: '300px',
    display: 'block',
    margin: '10px 0',
    maxWidth: '100%',
  },
  smallImg: {
    verticalAlign: 'middle',
    width: '30px',
    hegiht: 'auto',
    maxWidth: '100%',
  }
};
