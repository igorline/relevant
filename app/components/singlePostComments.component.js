import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  InteractionManager,
  RefreshControl,
  ListView,
  TouchableHighlight,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Comment from './comment.component';
import SinglePostComponent from './singlePost.component';

let styles;

class SinglePostComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputHeight: 0,
      editing: false,
    };
    this.post = null;
    this.id = null;
    this.comments = null;
    this.renderRow = this.renderRow.bind(this);
    this.dataSource = null;
    this.renderComments = this.renderComments.bind(this);
    this.loadMoreComments = this.loadMoreComments.bind(this);
    this.longFormat = false;
    this.total = null;
    this.renderHeader = this.renderHeader.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.reloading = false;
    this.reload = this.reload.bind(this);
    this.scrollToComment = this.scrollToComment.bind(this);
  }

  componentWillMount() {
    this.id = this.props.post;

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

  toggleEditing(bool, num) {
    console.log('toggleEditing', this.props);
    if (bool) this.scrollToComment(num);
    if (this.props.singlePostEditing) this.props.singlePostEditing(bool);
    this.setState({ editing: bool });
  }

  scrollToComment(num) {
    this.scrollView.scrollTo({ x: 0, y: num, animated: true });
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

  renderHeader() {
    let headerEl = [];
    headerEl.push(<SinglePostComponent key={0} post={this.postId} {...this.props} styles={styles} />);

    if (this.longFormat) {
      if (this.comments && this.total) {
        if (this.total > this.comments.length) {
          headerEl.push(<TouchableHighlight
            key={1}
            underlayColor={'transparent'}
            onPress={this.loadMoreComments}
            style={styles.loadMoreButton}
          >
            <Text>load earlier...</Text>
          </TouchableHighlight>);
        }
      }
    }
    return headerEl;
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
        contentContainerStyle={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10 }}
        contentInset={{ bottom: Math.min(100, this.props.inputHeight) }}
        onEndReached={!this.longFormat ? this.loadMoreComments : null}
        onEndReachedThreshold={100}
        ref={(scrollView) => {
          this.scrollView = scrollView;
        }}
        onContentSizeChange={(height) => {
          this.state.scrollToBottomY = height;
        }}
        onLayout={(e) => {
          this.elHeight = e.nativeEvent.layout.height;
        }}
        renderHeader={this.renderHeader}
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
    }
    return null;
  }

  render() {
    return this.renderComments();
  }
}

export default SinglePostComments;

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

