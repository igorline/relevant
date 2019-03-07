import React from 'react';

let styles;

export default function Component() {
  return (
    <container className="main">
      <container style={styles.faq}>
        <h1>FAQ</h1>

        <h3>What is Relevant?</h3>
        <p style={styles.p}>
          Relevant is a community-based network for building trust, curating content and
          earning rewards. Learn more{' '}
          <a target="_blank" href="https://blog.relevant.community">
            here
          </a>
          .
        </p>

        <h3>How is Relevant different from other social platforms?</h3>
        <p style={styles.p}>
          Unlike networks that rely on ad money and opaque algorithms, Relevant uses a
          reputation system that enables users to earn rewards for curating
          community-specific feeds. Instead of ranking content according to clicks,
          trusted community members decide which posts have the most value. Plus, curation
          rewards can be exchanged for tokens on the Ethereum network (REL) that represent
          ownership in the platform.
        </p>

        <h3>What is a Relevant community?</h3>
        <p style={styles.p}>
          Each Relevant community is similar to a subreddit. Users can upvote, downvote,
          and discuss links, only instead of using the number of upvotes to rank posts, we
          look at who upvoted posts to determine their value. That’s why on Relevant, one
          upvote from a trusted user is worth a lot more than a million votes from bot
          accounts.
        </p>

        <h3>How do I join a community?</h3>
        <p style={styles.p}>
          You can join a community by making posts, commenting on links or voting on
          content in a community thread. You will have a seperate Reputation score for
          each community you become a member of.
        </p>

        <h3>What is Reputation?</h3>
        <p style={styles.p}>
          Reputation is a metric for measuring quality and trust on the Relevant network.
        </p>
        <div style={styles.subsection}>
          <h4 style={styles.h4}>User Reputation</h4>
          <p style={styles.p}>
            Each user has a Reputation score. You earn Reputation when reputable community
            members upvote your comments. The higher your Reputation, the more impact your
            votes have. Reputation scores are community-specific and non-transferrable.
          </p>

          <h4 style={styles.h4}>Comment Reputation</h4>
          <p style={styles.p}>
            Comments are ranked according to their Reputation score. Comment Reputation
            comes from upvotes and downvotes.
          </p>

          <h4 style={styles.h4}>Link Ranking</h4>
          <p style={styles.p}>
            Like comments, links are ranked according to the Reputation of the users who
            upvote them. Users do not earn Reputation from upvoting links.
          </p>
        </div>

        <h3>How do I get coins?</h3>
        <p style={styles.p}>
          Earn coins by upvoting quality posts. You have 3 days to upvote a post after it
          goes live. If that post is upvoted by users with high-Reputation scores, you’ll
          earn rewards. You don’t earn coins from posting content, only from upvoting. You
          can also earn coins by [inviting friends] to join Relevant.
        </p>

        <h3>
          On IOS, how do you I share an article directly from Chrome, Safari or another
          app?
        </h3>
        <ul>
          <li>
            Press on the share icon{' '}
            <img
              alt={'share icon'}
              style={styles.smallImg}
              src={'/img/faq/shareIcon.jpg'}
            />
          </li>
          <li>
            Press "More" button{' '}
            <img alt={'share menu'} style={styles.bigImg} src={'/img/faq/share.jpg'} />
          </li>
          <li>
            Toggle on Relevant app{' '}
            <img alt={'share toggle'} style={styles.bigImg} src={'/img/faq/toggle.jpg'} />
          </li>
          <li>
            Press on Relevant icon{' '}
            <img
              alt={'share button'}
              style={styles.bigImg}
              src={'/img/faq/shareRelevant.jpg'}
            />
          </li>
        </ul>

        {/* <h3>I saw something innapropriate, what do I do?</h3>
        <p style={styles.p}>
          Please help us by flagging any inappropriate content. Under each post, press 'downvote'
          then 'Inappropriate'. Flagged content will be reviewed by the admins and removed if
          necessary.
        </p>

        <h3>I’m being harassed, can I block a user?</h3>
        <p style={styles.p}>
          If you are being harassed by someone, you can block that user. Go to any user's profile,
          click on their name in the top navigation bar -> Block User. You can see the list of
          blocked users under your profile -> gear icon -> blocked users.
        </p>
        <p style={styles.p}>
          Blocked users will not be able see your posts, upvote, comment or @mention you.
        </p> */}

        <p style={styles.p}>
          Got more questions?{' '}
          <a href={'mailto:info@relevant.community'} target="_blank">
            Email Us
          </a>
        </p>
      </container>
    </container>
  );
}

styles = {
  faq: {
    maxWidth: '800px',
    margin: 'auto',
    marginBottom: '40px'
  },
  subsection: {
    paddingLeft: '16px'
  },
  h4: {
    marginVertical: '5px'
  },
  p: {
    marginTop: '0px',
    marginLeft: '0px'
  },
  bigImg: {
    width: '300px',
    display: 'block',
    margin: '10px 0',
    maxWidth: '100%'
  },
  smallImg: {
    verticalAlign: 'middle',
    width: '30px',
    hegiht: 'auto',
    maxWidth: '100%'
  }
};
