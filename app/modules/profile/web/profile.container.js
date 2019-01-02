import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserActions from 'modules/user/user.actions';
import * as PostActions from 'modules/post/post.actions';
import Eth from 'modules/web_ethTools/eth.context';
import Profile from './profile.component';
import UserPosts from './userPosts.component';

const pageSize = 10;

class ProfileContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    match: PropTypes.object
  };

  constructor() {
    super();
    this.state = {};
    this.grabPosts = this.grabPosts.bind(this);
  }

  // Get user object based on userid param in route
  grabUser() {
    const { id } = this.props.match.params;
    this.props.actions.getSelectedUser(id);
  }

  // Get array of posts based on userid param in route
  grabPosts(l) {
    const { id } = this.props.match.params;
    this.props.actions.getUserPosts(l || 0, pageSize, id);
  }

  componentDidMount() {
    this.grabUser();
  }

  componentDidUpdate(nextProps) {
    const { id } = this.props.match.params;
    if (id !== nextProps.match.params.id) {
      this.grabUser();
    }
  }

  render() {
    return (
      <div style={{ flex: 1 }}>
        <Eth.Consumer>{wallet => <Profile wallet={wallet} {...this.props} />}</Eth.Consumer>
        <UserPosts {...this.props} load={this.grabPosts} pageSize={pageSize} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  user: state.user,
  posts: state.posts,
  investments: state.investments,
  myPostInv: state.investments.myPostInv
});

const mapDispatchToProps = dispatch =>
  Object.assign(
    {},
    { dispatch },
    {
      actions: bindActionCreators(
        Object.assign(
          {},
          {
            ...UserActions,
            ...PostActions
          }
        ),
        dispatch
      )
    }
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileContainer);
