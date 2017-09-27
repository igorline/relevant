import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NewMessage from '../message/newMessage';
import Avatar from '../common/avatar.component';
import * as MessageActions from '../../../actions/message.actions';

if (process.env.BROWSER === true) {
  require('./profile.css');
}

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMsgForm: false
    };
  }

  onClick(e) {
    e.preventDefault();
    this.setState({ showMsgForm: !this.state.showMsgForm });
  }

  render() {
    const userPath = this.props.user.users[this.props.params.id];
    // console.log(this.props)
    // console.log(userPath)
    if (userPath) {
      return (
        <div className='profileContainer'>
          <div className='profileHero'>
            <Avatar user={userPath} />
            <div className='name'>{userPath.name}</div>
            <div className='relevance'>
              <img src='/img/r-emoji.png' className='r' />
              {Math.round(userPath.relevance)}
              <img src='/img/coin.png' className='coin' />
              {Math.round(userPath.balance)}
            </div>
            <div className='subscribers'>
              {'Subscribers: '}<b>{userPath.followers}</b>
              {' • '}
              {'Following: '}<b>{userPath.following}</b>
            </div>
            <div className='tags'>
              {'Expertise: '}
              {(userPath.topTags || []).map((tag,i) => {
                return (<a className='tag' key={i}>{'#' + tag.tag + ' '}</a>)
              })}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

// <br />
// <a onClick={this.onClick.bind(this)} href="#">Thirsty?</a>
// {this.state.showMsgForm && <NewMessage {...this.props} />}
// Circle avatar
// dots
// R score
// percent change
// coins
// subscribers <b> middot subscribed to <b>
// Expertise: #hashtags
//
// __________________________
// Posts 85 |  Upvotes 152
// =========|________________
// (centered.. circular font)

Profile.defaultProps = {
  profile: { userPosts: [] }
};

const mapStateToProps = (state) => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message || state.message,
  user: state.user,
  posts: state.posts,
  profile: state.profile,
  investments: state.investments,
});

const mapDispatchToProps = (dispatch) => (Object.assign({}, { dispatch }, {
  actions: bindActionCreators(Object.assign({}, MessageActions), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
