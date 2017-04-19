import React from 'react';

let styles;

export default function Component() {
  return (
    <container className='main'>
      <container style={styles.faq}>
        <h1>FAQ</h1>

        <h3>How is Relevant different from other social platforms?</h3>
        <p style={styles.p}>
        Relevant is a social news reader that promotes reliable information and rewards expertise. Instead of relying on quantity (# of likes, followers), Relevant’s algorithm relies on a quality metric - relevance score. This system is designed to penalise clickbait and fake news while promoting useful and reliable information. 
        </p>

        <h3>What is a ‘relevance score’?</h3>
        <p style={styles.p}>
        Relevance is how we measure quality. Both users and posts have a relevance score. For posts, instead of only counting upvotes, we consider the ‘quality’ of those upvotes (which is based on the voter's relevance score). Users with high relevance scores are considered experts and their opinion matters more.
        </p>

        <h3>How do I subscribe to someone?</h3>
        <p style={styles.p}>
        You need to upvote a post in order to subscribe to someone. When you upvote one post, you subscribe to the next 3 posts from the author and they will show up in your feed. If you don’t upvote any of their following posts, your subscription to that person will expire. 
        </p>

        <h3>How is a post's relevance calculated?</h3>
        <p style={styles.p}>
        We weigh each upvote and downvote according to the user’s relevance score. For example: when someone with a high relevance score upvotes a post, the relevance score of that post increases dramatically.
        </p>

        <h3>Why do I get more relevance points from some people than others?</h3>
        <p style={styles.p}>
        When someone with more relevance than you upvotes one of your posts, you earn more relevance. If they have less relevance than you, you earn one relevant point.
        </p>

        <h3>My post got 10 Relevant points, but my own relevance only increased by 1 point. Why?</h3>
        <p style={styles.p}>
        When someone with less relevance than you upvotes one of your posts, you earn one relevance point. If someone with more relevance than you upvotes your post, you earn one or more points (depending on how high the voter’s score is).  
        </p>

        <h3>How do you I share an article directly from Chrome, Safari or another app?</h3>
        <ul>
          <li>Press on the share icon <img alt={'share icon'} style={styles.smallImg} src={'/img/faq/shareIcon.jpg'} /></li>
          <li>Press "More" button <img alt={'share menu'} style={styles.bigImg} src={'/img/faq/share.jpg'} /></li>
          <li>Toggle on Relevant app <img alt={'share toggle'} style={styles.bigImg} src={'/img/faq/toggle.jpg'} /></li>
          <li>Press on Relevant icon <img alt={'share button'} style={styles.bigImg} src={'/img/faq/shareRelevant.jpg'} /></li>
        </ul>

        <h3>I saw something innapropriate, what do I do?</h3>
        <p style={styles.p}>
        Please help us by flagging any inappropriate content. Under each post, press 'downvote' then 'Inappropriate'. Flagged content will be reviewed by the admins and removed if necessary.
        </p>

        <h3>I’m being harassed, can I block a user?</h3>
        <p style={styles.p}>
        If you are being harassed by someone, you can block that user. Go to any user's profile, click on their name in the top navigation bar -> Block User. You can see the list of blocked users under your profile -> gear icon -> blocked users. 
        </p>
        <p style={styles.p}>
        Blocked users will not be able see your posts, upvote, comment or @mention you.
        </p>
      </container>
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
