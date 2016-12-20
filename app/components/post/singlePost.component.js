import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostImage from './postImage.component';
// import Comment from '../comment.component';

let styles;

class SinglePostComponent extends Component {
  constructor(props) {
    super(props);
    this.renderPost = this.renderPost.bind(this);
  }

  componentWillMount() {
    this.id = this.props.post;
    if (this.props.posts.posts[this.props.post]) {
      this.post = this.props.posts.posts[this.props.post];
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.posts.posts[this.props.post] !== next.posts.posts[this.props.post]) {
      this.post = next.posts.posts[this.props.post];
    }
  }

  renderPost() {
    let imageEl = null;
    if (this.post) {
      if (this.post.image) imageEl = <PostImage post={this.post} />;
      return (<View style={{}}>
        {imageEl}
        <PostInfo navigator={this.props.navigator} post={this.post} />
        <PostBody expanded {...this.props} post={this.post} editing={false} />
        <PostButtons {...this.props} post={this.post} comments={null} />
      </View>);
    }
    return null;
  }

  render() {
    return this.renderPost();
  }
}

export default SinglePostComponent;

const localStyles = StyleSheet.create({
  postScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },
  comment: {
    marginLeft: 25,
    marginRight: 4,
    marginBottom: 10,
  },
  commentary: {
    marginRight: 4,
    marginLeft: 4,
    marginTop: 3,
    marginBottom: 10
  },
  postContainer: {
    paddingBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
});

styles = { ...localStyles, ...globalStyles };

