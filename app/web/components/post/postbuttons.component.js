import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

class PostButtons extends Component {
  static propTypes = {
    auth: PropTypes.object,
    myPostInv: PropTypes.object,
    post: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
    this.vote = this.vote.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.share = this.share.bind(this);
  }

  async vote(e) {
    try {
      e && e.preventDefault();
      e.stopPropagation();

      if (!this.props.auth.isAuthenticated) return null;

      let amount = 1;
      await this.props.actions.vote(
        amount,
        this.props.post,
        this.props.auth.user
      );
      alert('Success!');

      // TODO animation & analytics
      // Analytics.logEvent('upvote');
      // this.props.actions.triggerAnimation('vote');
      // setTimeout(() => {
      //   // this.props.actions.reloadTab('read');
      //   let name = this.props.post.embeddedUser.name;
      //   alert('You have subscribed to receive ' + results.subscription.amount + ' posts from ' + name);
      // }, 1500);
    } catch (err) {
      console.log(err);
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = 'Oops! Looks like you ran out of coins, but don\'t worry, you\'ll get more tomorrow';
      }
      alert(text1);
    }
    return null;
  }

  async irrelevant(e) {
    try {
      e && e.preventDefault();
      e.stopPropagation();

      if (!this.props.auth.isAuthenticated) return;
      // for testing
      // this.props.actions.triggerAnimation('vote', -1);
      // this.props.actions.triggerAnimation('irrelevant', -1);
      // return;

      await this.props.actions.vote(-1, this.props.post, this.props.auth.user);
      alert('Success!');

      // TODO animations
      // this.props.actions.triggerAnimation('vote', -1);
      // this.props.actions.triggerAnimation('irrelevant', -1);
    } catch (err) {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = 'Oops! Looks like you ran out of coins, but don\'t worry, you\'ll get more tomorrow';
      }
      alert(text1);
    }
  }

  async share(e) {
    e && e.preventDefault();
    return null;
  }

  render() {
    let post = this.props.post;

    if (post === 'notFound') {
      return null;
    }
    if (!post) return null;

    let vote;
    let votedUp;
    let votedDown;
    let buttonOpacity = { opacity: 1 };

    if (this.props.myPostInv) {
      vote = this.props.myPostInv[post.id] || !this.props.isAuthenticated;
      if (vote) {
        votedUp = vote.amount > 0;
        votedDown = vote.amount < 0;
        buttonOpacity = { opacity: 0.5 };
      }
    }

    let comments = post.commentCount || '';
    let commentText = comments > 1 ? comments + ' comments' : comments + ' comment';

    return (
      <div className="postbuttons">
        <div className="left">
          <a
            style={buttonOpacity}
            onClick={e => vote ? e.stopPropagation() : this.vote(e)}
          >
            <img alt="Upvote" src={votedUp ? '/img/upvoteActive.png' : '/img/upvote-shadow.svg'} className="upvote" />
          </a>
          <div className="fraction">
{/*            <div className="num">
              {post.upVotes}
            </div>*/}
            <div className="dem">
              {post.relevance}
              <img alt="R" src="/img/r-gray.svg" />
            </div>
          </div>
          <a
            style={buttonOpacity}
            onClick={e => vote ? e.stopPropagation() : this.irrelevant(e)}
          >
            <img alt="Downvote" src={votedDown ? '/img/downvote-blue.svg' : '/img/downvote-gray.svg'} className="downvote" />
          </a>
        </div>
        <div className="right">
          <Link className="commentcount details" to={'/post/' + post._id}>
            <img alt="Comment" src="/img/comment.svg" />
            <span>{commentText}</span>
          </Link>
{/*          <Link to={'/post/' + post._id}>
            <img alt="Share" src="/img/share.png" className="share" />
          </Link>*/}
        </div>
      </div>
    );
  }
}

export default PostButtons;
