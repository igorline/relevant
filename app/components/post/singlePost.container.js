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
    let { posts } = this.props;
    let id = this.props.scene.id;
    let post = posts.posts[id];
    // let related = posts.related[id];

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
    let id = this.props.scene.id;
    this.props.actions.getSelectedPost(id);
    this.props.actions.getComments(id);
  }

  render() {
    let dataEl = null;
    let id = this.props.scene.id;
    let { posts } = this.props;
    let post = posts.posts[id];

    let commentIds = this.props.comments.commentsById[id] || {};
    let related = posts.related[id] || [];
    let link = post && posts.links[post.metaPost];

    if (post) {
      dataEl = (<SinglePost
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
          visible={(!post) && !this.props.error}
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
    users: state.user.users,
    tags: state.tags,
    myPostInv: state.investments.myPostInv,
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
