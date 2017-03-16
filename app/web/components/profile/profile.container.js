import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Profile from './profile';
import UserPosts from './userPosts';
import * as ProfileActions from '../../actions/profile'
import * as MessageActions from '../../actions/message'

class ProfileContainer extends Component {
  constructor(props) {
    super(props)
  }

  // Get user object based on userid param in route
  grabUser() {
    var self = this;
    this.props.getSelectedUser(this.props.params.id);
  }

  // Get array of posts based on userid param in route
  grabPosts() {
    var self = this;
    this.props.getUsersPosts(this.props.params.id);
  }

  componentWillMount() {
    this.grabUser()
    this.grabPosts()
  }

  componentDidUpdate(next) {
    if (this.props.params.id !== next.params.id) {
      this.grabUser()
      this.grabPosts()
    }
  }

  render () {
    return (
      <div>
        <Profile { ...this.props} />
        <UserPosts { ...this.props} />
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      profile: state.profile
    }
  },
  dispatch => {
    return Object.assign({}, { dispatch }, bindActionCreators({...ProfileActions, ...MessageActions}, dispatch))
  }
)(ProfileContainer)
