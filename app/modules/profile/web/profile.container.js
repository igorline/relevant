import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserActions from 'modules/user/user.actions';
import * as PostActions from 'modules/post/post.actions';
import { logoutAction } from 'modules/auth/auth.actions';
import Eth from 'modules/web_ethTools/eth.context';
import { authProps } from 'app/utils/propValidation';
import Profile from './profile.component';
import UserPosts from './userPosts.component';

const pageSize = 10;

class ProfileContainer extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    match: PropTypes.object,
    usersState: PropTypes.object.isRequired,
    auth: authProps,
  };

  state = {
    user: {}
  }

  static getDerivedStateFromProps(props) {
    const { auth, match, usersState } = props;
    const handle = match.params.id;
    const userId = usersState.handleToId[handle];
    const user = usersState.users[userId];
    if (!user) return null;
    const isOwner = auth.user && user._id === auth.user._id;
    return { user, isOwner };
  }

  // Get user object based on userid param in route
  grabUser() {
    const { id } = this.props.match.params;
    this.props.actions.getSelectedUser(id);
  }

  // Get array of posts based on userid param in route
  grabPosts = (l) => {
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
        <Profile
          key={this.state.user._id + 'profile'}
          {...this.props}
          {...this.state}
        />
        <UserPosts
          key={this.state.user._id}
          {...this.props}
          {...this.state}
          load={this.grabPosts}
          pageSize={pageSize}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  usersState: state.user,
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
            ...PostActions,
            logoutAction,
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
