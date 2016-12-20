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
import * as investActions from '../actions/invest.actions';
import * as createPostActions from '../actions/createPost.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post/post.component';
import * as animationActions from '../actions/animation.actions';
import CustomSpinnerRelative from '../components/customSpinnerRelative.component';
import ErrorComponent from '../components/error.component';
import SinglePostComponent from '../components/post/singlePost.component';
import SinglePostComments from '../components/post/singlePostComments.component';

let styles;

class SinglePost extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      inputHeight: 0,
      editing: false,
    };
    this.createComment = this.createComment.bind(this);
    this.setEditing = this.setEditing.bind(this);
    this.reload = this.reload.bind(this);
    this.renderInput = this.renderInput.bind(this);
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

  setEditing(bool) {
    this.setState({ editing: bool });
  }

  reload() {
    this.props.actions.getSelectedPost(this.postId);
  }

  renderInput() {
    if (!this.state.editing) {
      return (<View
        style={[
          styles.commentInputParent,
          { height: Math.min(100, this.state.inputHeight) }
        ]}
      >
        <TextInput
          ref={(c) => { this.textInput = c; }}
          style={[
            styles.commentInput,
            styles.font15
          ]}
          placeholder="Enter comment..."
          multiline
          onChangeText={comment => this.setState({ comment })}
          value={this.state.comment}
          returnKeyType="default"
          onContentSizeChange={(event) => {
            let h = event.nativeEvent.contentSize.height;
            this.setState({
              inputHeight: Math.max(50, h)
            });
          }}
        />
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.commentSubmit]}
          onPress={() => this.createComment()}
        >
          <Text style={[styles.font15, styles.active]}>Submit</Text>
        </TouchableHighlight>
      </View>);
    }
    return null;
  }


  createComment() {
    if (!this.state.comment.length) {
      AlertIOS.alert('no comment');
    }
    let comment = this.state.comment.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '');
    let commentObj = {
      post: this.postId,
      text: comment,
      user: this.props.auth.user._id
    };
    this.props.actions.createComment(this.props.auth.token, commentObj);
    this.setState({ comment: '' });
    this.textInput.blur();
  }

  render() {
    let dataEl = null;

    this.postData = this.props.posts.posts[this.postId];
    this.commentsData = this.props.comments.commentsById[this.postId];

    if (this.postData && !this.props.error.singlepost) {
      dataEl = (<SinglePostComments
        post={this.postId}
        {...this.props}
        singlePostEditing={this.setEditing}
        inputHeight={this.state.inputHeight}
        styles={styles}
      />);
    }

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ height: fullHeight - 114 }}
        keyboardVerticalOffset={64}
      >
        <View style={{ flex: 1, position: 'relative', backgroundColor: 'white' }}>
          {dataEl}
          <CustomSpinnerRelative
            visible={(!this.postData || !this.commentsData) &&
              !this.props.error.singlepost}
          />
          <ErrorComponent parent={'singlepost'} reloadFunction={this.reload} />
          {this.renderInput()}
        </View>
      </KeyboardAvoidingView>
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
    error: state.error,
    comments: state.comments,
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
      ...createPostActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
