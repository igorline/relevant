import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  InteractionManager,
  KeyboardAvoidingView,
  TextInput,
  TouchableHighlight,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as statsActions from '../actions/stats.actions';
import * as tagActions from '../actions/tag.actions';
import * as investActions from '../actions/invest.actions';
import * as createPostActions from '../actions/createPost.actions';
import * as navigationActions from '../actions/navigation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
// import Post from '../components/post/post.component';
import * as animationActions from '../actions/animation.actions';
import CustomSpinnerRelative from '../components/customSpinnerRelative.component';
import ErrorComponent from '../components/error.component';

// import SinglePostComponent from '../components/post/singlePost.component';
import SinglePost from '../components/post/singlePost.component';


let styles;

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

    if (!this.postData) {
      InteractionManager.runAfterInteractions(() => {
        this.props.actions.getSelectedPost(this.postId);
      });
    }
  }

  shouldComponentUpdate(next) {
    // console.log('updating single post');
    // for (let p in next) {
    //   if (next[p] !== this.props[p]) {
    //     console.log(p);
    //     for (let pp in next[p]) {
    //       if (next[p][pp] !== this.props[p][pp]) console.log('--> ', pp);
    //     }
    //   }
    // }
    return true;
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

    if (this.postData && !this.props.error) {
      dataEl = (<SinglePost
        post={this.postId}
        scene={this.props.scene}
        {...this.props}
        singlePostEditing={this.setEditing}
      />);
    }

    return (
      <View
        // behavior={'padding'}
        style={{ flex: 1 }}
        // keyboardVerticalOffset={64}
      >
        <View
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: 'white'
          }}
        >
          <CustomSpinnerRelative
            visible={(!this.postData || !this.commentsData) &&
              !this.props.error}
          />
          {dataEl}
          <ErrorComponent parent={'singlepost'} reloadFunction={this.reload} />
        </View>
      </View>
    );
  }
}


const localStyles = StyleSheet.create({
  singlePostContainer: {
    width: fullWidth,
    flex: 1,
  },
});

styles = { ...localStyles, ...globalStyles };

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
