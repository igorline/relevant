import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Profile from './profile.component';
import UserPosts from './userPosts.component';
import * as MessageActions from '../../../actions/message.actions';
import * as UserActions from '../../../actions/user.actions';
import * as PostActions from '../../../actions/post.actions';

class ProfileContainer extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  // Get user object based on userid param in route
  grabUser() {
    this.props.actions.getSelectedUser(this.props.params.id);
  }

  // Get array of posts based on userid param in route
  grabPosts() {
    this.props.actions.getUserPosts(0, 5, this.props.params.id);
  }

  componentDidMount() {
    this.grabUser();
    this.grabPosts();
  }

  componentDidUpdate(nextProps) {
    if (this.props.params.id !== nextProps.params.id) {
      this.grabUser();
      this.grabPosts();
    }
  }

  render() {
    return (
      <div style={{ flex: 1 }}>
        <Profile {...this.props} />
        <UserPosts {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  user: state.user,
  posts: state.posts,
  investments: state.investments,
  myPostInv: state.investments.myPostInv,
});

const mapDispatchToProps = (dispatch) => (Object.assign({}, { dispatch }, {
  actions: bindActionCreators(Object.assign({}, {
    ...UserActions,
    ...MessageActions,
    ...PostActions
  }), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer);
