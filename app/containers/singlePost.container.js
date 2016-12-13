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
import * as createPostActions from '../actions/createPost.actions';
import { globalStyles, fullWidth } from '../styles/global';
import Post from '../components/post.component';
import * as animationActions from '../actions/animation.actions';
import CustomSpinner from '../components/CustomSpinner.component';
import ErrorComponent from '../components/error.component';
import SingplePostComponent from '../components/singlePost.component';

let styles;

class SinglePost extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
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

  reload() {
    this.props.actions.getSelectedPost(this.postId);
  }

  render() {
    let el = null;

    this.postData = this.props.posts.posts[this.postId];

    if (this.postData && !this.props.error.singlepost) {
      el = (<ScrollView style={styles.fullContainer}>
        <View>
          <SingplePostComponent post={this.postId} {...this.props} styles={styles} />
        </View>
      </ScrollView>);
    }

    return (
      <View style={[{ backgroundColor: 'white', flex: 1 }]}>
        {el}
        <CustomSpinner visible={!this.postData && !this.props.error.singlepost} />
        <ErrorComponent parent={'singlepost'} reloadFunction={this.reload} />
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
    error: state.error,
    comments: state.comments
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
      ...createPostActions
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
