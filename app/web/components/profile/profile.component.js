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
    const user = this.props.user.users[this.props.params.id];
    if (! user) {
      <div className='profileContainer'>
        User not found!
      </div>
    }
    return (
      <div className='profileContainer'>
        <div className='profileHero'>
          <Avatar user={user} />
          <div className='name'>{user.name}</div>
          <div className='relevance'>
            <img src='/img/r-emoji.png' className='r' />
            {Math.round(user.relevance || 0)}
            <img src='/img/coin.png' className='coin' />
            {Math.round(user.balance || 0)}
          </div>
          <div className='subscribers'>
            {'Subscribers: '}<b>{user.followers}</b>
            {' • '}
            {'Subscribed to: '}<b>{user.following}</b>
          </div>
          <div className='tags'>
            {'Expertise: '}
            {(user.topTags || []).map((tag,i) => {
              return (<a className='tag' key={i}>{'#' + tag.tag + ' '}</a>)
            })}
          </div>
        </div>
      </div>
    );
  }
}

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
