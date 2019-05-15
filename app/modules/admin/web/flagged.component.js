import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as postActions from 'modules/post/post.actions';
import PostComponent from 'modules/post/web/post.component';
import { Button, View, Title } from 'modules/styled/web';

class Flagged extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    flagged: PropTypes.array,
    metaPosts: PropTypes.object,
    posts: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getFlaggedPosts();
  }

  render() {
    const { flagged, posts, auth, actions } = this.props;

    const postsEl = flagged.map(p => {
      const post = posts.posts[p];
      const parentPost = post.parentPost ? posts.posts[post.parentPost] : null;
      const link = posts.links[post.metaPost];
      const authorizedToDelete =
        post.user === auth.user._id || auth.user.role === 'admin';

      return (
        <View>
          <PostComponent
            key={post._id}
            {...this.props}
            flagged={post.flagged}
            post={parentPost || post}
            comment={parentPost ? post : null}
            link={link}
          >
            {authorizedToDelete && (
              <View>
                <Button bg="red" w={12} m={4} onClick={() => actions.deletePost(post)}>
                  Delete
                </Button>
              </View>
            )}
          </PostComponent>
        </View>
      );
    });

    return (
      <View fdirection={'column'}>
        <Title m={'0 4'}>Flagged Posts</Title>
        {postsEl}
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    flagged: state.posts.flagged,
    posts: state.posts,
    all: state.posts
  }),
  dispatch => ({
    actions: bindActionCreators(postActions, dispatch)
  })
)(Flagged);
