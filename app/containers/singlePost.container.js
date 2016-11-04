import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  InteractionManager
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as statsActions from '../actions/stats.actions';
import * as investActions from '../actions/invest.actions';
import { globalStyles, fullWidth } from '../styles/global';
import Post from '../components/post.component';
import * as animationActions from '../actions/animation.actions';
import CustomSpinner from '../components/CustomSpinner.component';

const localStyles = StyleSheet.create({
  singlePostContainer: {
    width: fullWidth,
    flex: 1,
  },
});

let styles = { ...localStyles, ...globalStyles };

class SinglePost extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      postId: null,
      postData: null
    };
  }

  componentDidMount() {
    if (this.props.posts.selectedPostId) {
      this.setState({ postId: this.props.posts.selectedPostId });
      if (this.props.posts.currentPostId === this.props.posts.selectedPostId) {
        if (this.props.posts.selectedPostData) {
          this.setState({ postData: this.props.posts.selectedPostData });
        }
      } else {
        InteractionManager.runAfterInteractions(() => {
          this.props.actions.getSelectedPost(this.props.posts.selectedPostId);
        })
      }
    }
  }

  componentWillReceiveProps(next) {
    if (next.posts.selectedPostId !== this.props.posts.selectedPostId) {
      this.setState({ postId: null, postData: null });
      this.props.actions.clearSelectedPost();
    }

    if (next.posts.selectedPostId) {
      if (!this.state.postId) this.setState({ postId: next.posts.selectedPostId });
      if (next.posts.selectedPostId === next.posts.currentPostId) {
        if (next.posts.selectedPostData) {
          this.setState({ postData: next.posts.selectedPostData });
        }
      }
    }
  }

  render() {
    let post = null;
    let el = null;
    if (this.state.postData) {
      post = this.state.postData;
      el = (<ScrollView style={styles.fullContainer}>
        <View>
          <Post post={post} {...this.props} styles={styles} />
        </View>
      </ScrollView>);
    }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {el}
        <CustomSpinner visible={!this.state.postData} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    stats: state.stats,
    users: state.user,
    investments: state.investments,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...statsActions,
      ...authActions,
      ...postActions,
      ...animationActions,
      ...investActions,
      ...userActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
