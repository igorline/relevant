import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  InteractionManager,
  RefreshControl,
  ListView
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostImage from './postImage.component';
import Comment from './comment.component';

let styles;

class SinglePostComponent extends Component {
  constructor(props) {
    super(props);
    this.post = null;
    this.id = null;
    this.comments = null;
    this.renderRow = this.renderRow.bind(this);
    this.dataSource = null;
    this.renderPost = this.renderPost.bind(this);
    this.renderComments = this.renderComments.bind(this);
    this.loadMoreComments = this.loadMoreComments.bind(this);
    this.longFormat = false;
    this.total = null;
    this.toggleEditing = this.toggleEditing.bind(this);
    this.reloading = false;
    this.reload = this.reload.bind(this);
  }

  componentWillMount() {
    this.id = this.props.post;

    if (this.props.posts.posts[this.props.post]) {
      this.post = this.props.posts.posts[this.props.post];
    }


    if (this.props.comments.commentsById[this.id]) {
      if (this.props.comments.commentsById[this.id].data) {
        this.comments = this.props.comments.commentsById[this.id].data;
      }
      if (this.props.comments.commentsById[this.id].total) {
        this.total = this.props.comments.commentsById[this.id].total;
        if (this.total > 10) this.longFormat = true;
      }
    }

    InteractionManager.runAfterInteractions(() => {
      if (!this.comments) this.loadMoreComments();
    });

    if (this.comments) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(this.comments);
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.posts.posts[this.props.post] !== next.posts.posts[this.props.post]) {
      this.post = next.posts.posts[this.props.post];
    }

    if (next.comments.commentsById[this.id] !== this.props.comments.commentsById[this.id]) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

      if (next.comments.commentsById[this.id]) {
        if (next.comments.commentsById[this.id].data) {
          this.dataSource = ds.cloneWithRows(next.comments.commentsById[this.id].data);
          this.comments = next.comments.commentsById[this.id].data;
        }

        if (next.comments.commentsById[this.id].total) {
          this.total = next.comments.commentsById[this.id].total;
          if (this.total > 10) this.longFormat = true;
        }
      }
    }
  }

  loadMoreComments() {
    let length = 0;
    if (this.comments && this.comments.length) length = this.comments.length;
    this.props.actions.getComments(this.id, length, 10);
  }

  renderPost() {
    let imageEl = null;
    if (this.post) {
      if (this.post.image) imageEl = <PostImage post={this.post} />;
      return (<View>
        {imageEl}
        <PostInfo navigator={this.props.navigator} post={this.post} />
        <PostBody {...this.props} post={this.post} editing={false} />
        {/* <PostButtons {...this.props} post={this.post} comments={this.comments} /> */}
      </View>);
    } else {
      return null;
    }
  }

  toggleEditing() {
    console.log('toggleEditing')
  }

  renderRow(rowData) {
    return (
      <Comment
        {...this.props}
        key={rowData._id}
        parentEditing={this.toggleEditing}
        parentId={this.id}
        comment={rowData}
      />
    );
  }

  reload() {
    this.reloading = true;
    this.props.actions.getComments(this.id, 0, 10);
  }

  renderComments() {
    if (this.comments) {
      return (<ListView
        enableEmptySections
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        initialListSize={10}
        dataSource={this.dataSource}
        renderRow={this.renderRow}
        keyboardShouldPersistTaps
        keyboardDismissMode={'on-drag'}
        automaticallyAdjustContentInsets={false}
        onEndReached={!this.longFormat ? this.loadMoreComments : null}
        onEndReachedThreshold={100}
        // contentInset={{ bottom: Math.min(100, this.state.inputHeight) }}
        ref={(scrollView) => {
          this.scrollView = scrollView;
        }}
        // onContentSizeChange={(height) => {
        //   this.state.scrollToBottomY = height;
        // }}
        // onLayout={(e) => {
        //   this.elHeight = e.nativeEvent.layout.height;
        // }}
        // renderHeader={this.renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={this.reloading}
            onRefresh={this.reload}
            tintColor="#000000"
            colors={['#000000', '#000000', '#000000']}
            progressBackgroundColor="#ffffff"
          />
        }
      />);
    } else {
      return null;
    }
  }

  render() {
    let commentsEl = null;

    return (
      <ScrollView
        decelerationRate={'fast'}
        contentContainerStyle={{ padding: 10 }}
        automaticallyAdjustContentInsets={false}
        snapToAlignment={'center'}
      >
        {this.renderPost()}
        {this.renderComments()}
      </ScrollView>
    );
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

