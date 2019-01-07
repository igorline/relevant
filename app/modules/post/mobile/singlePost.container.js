import React, { Component } from 'react';
import { View, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from 'modules/auth/auth.actions';
import * as userActions from 'modules/user/user.actions';
import * as postActions from 'modules/post/post.actions';
import * as statsActions from 'modules/stats/stats.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as animationActions from 'modules/animation/animation.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import CustomSpinnerRelative from 'modules/ui/mobile/customSpinnerRelative.component';
import ErrorComponent from 'modules/ui/mobile/error.component';
import SinglePost from './singlePost.component';

class SinglePostContainer extends Component {
  static propTypes = {
    scene: PropTypes.object,
    actions: PropTypes.object,
    comments: PropTypes.object,
    users: PropTypes.object,
    auth: PropTypes.object,
    error: PropTypes.bool,
    posts: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      inputHeight: 0,
      editing: false,
      comment: null
    };
    this.setEditing = this.setEditing.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentWillMount() {
    const { posts, scene } = this.props;
    const { id } = scene;
    const post = posts.posts[id];

    InteractionManager.runAfterInteractions(() => {
      if (!post) {
        this.props.actions.getSelectedPost(id);
      }
      this.props.actions.getComments(id);
    });
  }

  setEditing(bool) {
    this.setState({ editing: bool });
  }

  reload() {
    const { id } = this.props.scene;
    this.props.actions.getSelectedPost(id);
    this.props.actions.getComments(id);
  }

  render() {
    let dataEl = null;
    const { id } = this.props.scene;
    const { posts } = this.props;
    const post = posts.posts[id];

    const commentIds = this.props.comments.commentsById[id] || {};
    const related = posts.related[id] || [];
    const link = post && posts.links[post.metaPost];

    if (post) {
      dataEl = (
        <SinglePost
          postId={id}
          post={post}
          link={link}
          postComments={commentIds}
          scene={this.props.scene}
          actions={this.props.actions}
          singlePostEditing={this.setEditing}
          error={this.error}
          users={this.props.users}
          auth={this.props.auth}
          related={related}
          {...this.props}
        />
      );
    }

    if (this.props.error && !this.postData) {
      return (
        <ErrorComponent
          error={this.props.error}
          parent={'singlepost'}
          reloadFunction={this.reload}
        />
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {dataEl}
        <CustomSpinnerRelative visible={!post && !this.props.error} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    error: state.error.singlepost,
    comments: state.comments,
    users: state.user.users,
    tags: state.tags,
    myPostInv: state.investments.myPostInv
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...statsActions,
        ...tagActions,
        ...authActions,
        ...postActions,
        ...animationActions,
        ...investActions,
        ...userActions,
        ...createPostActions,
        ...navigationActions,
        ...tooltipActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SinglePostContainer);