import React, { Component, PropTypes } from 'react';
import * as utils from '../../../utils';

class PostButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.invest = this.invest.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.share = this.share.bind(this);
  }

  async invest(e) {
    e && e.preventDefault()
    if (! this.props.auth.isAuthenticated) return null

    let investAmount = 1;

    this.props.actions.invest(
      await utils.token.get(),
      investAmount,
      this.props.post,
      this.props.auth.user
    )
    .then((results) => {
      if (results) {
        // this.props.actions.triggerAnimation('invest');
        setTimeout(() => {
          // this.props.actions.reloadTab('read');
          let name = this.props.post.embeddedUser.name;
          alert('You have subscribed to receive ' + results.subscription.amount + ' posts from ' + name);
          // Analytics.logEvent('upvote');
        }, 1500);
      }
    })
    .catch(err => {
      console.log(err)
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = 'Oops! Looks like you ran out of coins, but don\'t worry, you\'ll get more tomorrow';
      }
      alert(text1);
    });
  }

  async irrelevant(e) {
    e && e.preventDefault()
    if (! this.props.auth.isAuthenticated) return null
    // this.props.actions.triggerAnimation('invest', -1);
    // this.props.actions.triggerAnimation('irrelevant', -1);
    // return;

    this.props.actions.invest(await utils.token.get(), -1, this.props.post, this.props.auth.user)
    .then((results) => {
      if (results) {
        // this.props.actions.triggerAnimation('invest', -1);
        // this.props.actions.triggerAnimation('irrelevant', -1);
      }
    })
    .catch(err => {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = 'Oops! Looks like you ran out of coins, but don\'t worry, you\'ll get more tomorrow';
      }
      alert(text1);
    });
  }

  async share(e) {
    e && e.preventDefault()
  }

  render() {
    let post = this.props.post;

    if (post === 'notFound') {
      return null;
    }
    if (!post) return null;

    return (
      <div className='postbuttons'>
        <div className='left'>
          <a onClick={this.invest} href='#'><img src='/img/upvote-shadow.svg' className='upvote' /></a>
          <div className='fraction'>
            <div className='num'>
              {post.upVotes}
            </div>
            <div className='dem'>
              {post.relevance}
              <img src='/img/r-gray.svg' />
            </div>
          </div>
          <a onClick={this.irrelevant} href='#'><img src='/img/downvote-gray.svg' className='downvote' /></a>
        </div>
        <div className='right'>
          <div className='commentcount'>
            <img src='/img/comment.svg' />
            <span>{post.commentCount}</span>
          </div>
          <a onClick={this.share} href='#'><img src='/img/share.png' className='share' /></a>
        </div>
      </div>
    );
  }
}
export default PostButtons;
