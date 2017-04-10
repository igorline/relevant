import React from 'react';

let styles;

export default function Component() {
  return (
    <container style={styles.faq}>
      <h1>FAQ</h1>
      <h3>How is post's relevance calculated?</h3>
      <p style={styles.p}>
        We weight each upvote and downvote by the users relevance. So when someone very relevant upvotes a post, the score changes dramatically.
      </p>

      <h3>Why do I get more relevance points from some people than others?</h3>
      <p style={styles.p}>When someone with more relevance than you upvotes one of your posts, you will earn more relevance</p>

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
    marginLeft: '40px',
  },
  bigImg: {
    width: '300px',
    display: 'block',
    margin: '10px 0',
  },
  smallImg: {
    verticalAlign: 'middle',
    width: '30px',
    hegiht: 'auto',
  }
}
