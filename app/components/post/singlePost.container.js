import React, { Component } from 'react';
import {
  View,
  InteractionManager,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../../actions/auth.actions';
import * as userActions from '../../actions/user.actions';
import * as postActions from '../../actions/post.actions';
import * as statsActions from '../../actions/stats.actions';
import * as tagActions from '../../actions/tag.actions';
import * as investActions from '../../actions/invest.actions';
import * as createPostActions from '../../actions/createPost.actions';
import * as navigationActions from '../../actions/navigation.actions';
import * as animationActions from '../../actions/animation.actions';
import CustomSpinnerRelative from '../customSpinnerRelative.component';
import ErrorComponent from '../error.component';
import SinglePost from './singlePost.component';


class SinglePostContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      inputHeight: 0,
      editing: false,
      comment: null,
    };
    this.setEditing = this.setEditing.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentWillMount() {
    this.postId = this.props.scene.id;
    this.postData = this.props.posts.posts[this.postId];
    this.related = this.props.posts.related[this.postId];

    InteractionManager.runAfterInteractions(() => {
      if (!this.postData) {
        this.props.actions.getSelectedPost(this.postId);
      } if (!this.related) {
        // this.props.actions.getRelated(this.postId, 0, 10);
      }
      this.props.actions.getComments(this.postId, 0, 10);
    });
  }

  setEditing(bool) {
    this.setState({ editing: bool });
  }

  reload() {
    this.props.actions.getSelectedPost(this.postId);
  }

  render() {
    let dataEl = null;

    this.postData = this.props.posts.posts[this.postId];
    this.commentsData = this.props.comments.commentsById[this.postId];
    let related = this.props.posts.related[this.postId] || [];

    if (this.postData) {
      dataEl = (<SinglePost
        postId={this.postId}
        post={this.postData}
        postComments={this.commentsData}
        scene={this.props.scene}
        actions={this.props.actions}
        singlePostEditing={this.setEditing}
        error={this.error}
        users={this.props.users}
        auth={this.props.auth}
        related={related}
        {...this.props}
      />);
    }

    if (this.props.error && !this.postData) {
      return <ErrorComponent error={this.props.error} parent={'singlepost'} reloadFunction={this.reload} />;
    }

    return (
      <View
        style={{ flex: 1 }}
      >
        {dataEl}
        <CustomSpinnerRelative
          visible={(!this.postData) && !this.props.error}
        />
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
    users: state.user,
    tags: state.tags,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...statsActions,
      ...tagActions,
      ...authActions,
      ...postActions,
      ...animationActions,
      ...investActions,
      ...userActions,
      ...createPostActions,
      ...navigationActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePostContainer);
