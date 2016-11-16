import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableHighlight,
  Dimensions,
  Keyboard,
  InteractionManager,
  ListView,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as postActions from '../actions/post.actions';
import { globalStyles } from '../styles/global';
import Comment from '../components/comment.component';
import CustomSpinner from '../components/CustomSpinner.component';
import ErrorComponent from '../components/error.component';

let styles;

class Comments extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      comment: '',
      visibleHeight: Dimensions.get('window').height,
      scrollView: ScrollView,
      scrollToBottomY: null,
    };
    this.renderRow = this.renderRow.bind(this);
    this.elHeight = null;
    this.loading = false;
    this.reloading = false;
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.dataSource = null;
    this.createComment = this.createComment.bind(this);
  }

  componentWillMount() {
    this.id = this.props.scene.id;
    this.comments = this.props.comments.commentsById[this.id];

    InteractionManager.runAfterInteractions(() => {
      if (!this.comments) {
        this.props.actions.getComments(this.id, 0);
      }
    });

    if (this.comments) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(this.comments);
    }

    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillReceiveProps(next) {
    if (next.comments.commentsById[this.id] !== this.props.comments.commentsById[this.id]) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(next.comments.commentsById[this.id]);
      this.comments = next.comments.commentsById[this.id];
      this.reloading = false;
      this.loadmore = false;
    }
  }

  componentDidUpdate(prev) {
    if (!prev) return;
    if (prev.comments.comments && prev.comments.comments !== this.props.comments.comments) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);
    }
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
    // this.props.actions.archiveComments(this.id);
  }

  keyboardWillHide() {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  scrollToBottom() {
    if (this.props.comments.comments.length < 7) return;
    let scrollDistance = this.state.scrollToBottomY - this.elHeight;
    this.state.scrollView.scrollTo({ x: 0, y: scrollDistance, animated: true });
  }

  createComment() {
    if (!this.state.comment.length) {
      AlertIOS.alert('no comment');
    }
    let commentObj = {
      post: this.id,
      text: this.state.comment,
      user: this.props.auth.user._id
    };
    this.props.actions.createComment(this.props.auth.token, commentObj);
    this.setState({ comment: '' });
  }

  renderRow(rowData, i) {
    return (
      <Comment {...this.props} key={i} parentId={this.id} comment={rowData} />
    );
  }

  reload() {
    this.reloading = true;
    this.props.actions.getComments(this.id, 0, 5);
  }

  loadMore() {
    if (this.loadmore) return;

    this.loadmore = true;
    let length = 0;
    if (this.comments && this.comments.length) {
      length = this.comments.length;
    }
    this.props.actions.getComments(this.id, length, 5);
  }

  render() {
    let commentsEl = null;
    if (this.dataSource) {
      commentsEl = (<ListView
        enableEmptySections
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        initialListSize={10}
        dataSource={this.dataSource}
        renderRow={this.renderRow}
        automaticallyAdjustContentInsets
        onEndReached={this.loadMore}
        onEndReachedThreshold={100}
        contentInset={{ bottom: 50 }}
        ref={(scrollView) => {
          this.state.scrollView = scrollView;
        }}
        onContentSizeChange={(height, width) => {
          this.state.scrollToBottomY = width;
        }}
        onLayout={(e) => {
          this.elHeight = e.nativeEvent.layout.height;
        }}
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

    return (
      <View style={[styles.commentsContainer, { height: this.state.visibleHeight - 114 }]}>
        {commentsEl}
        <View style={[styles.commentInputParent]}>

          <TextInput
            style={[styles.commentInput, styles.font15]}
            placeholder="Enter comment..."
            multiline={false}
            onChangeText={comment => this.setState({ comment })}
            value={this.state.comment}
            returnKeyType="done"
          />
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.commentSubmit]}
            onPress={() => this.createComment()}
          >
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>

        </View>
        <CustomSpinner visible={!this.dataSource && !this.props.error.comments} />
        <ErrorComponent parent={'comments'} reloadFunction={this.reload} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  commentsContainer: {
    backgroundColor: 'white',
    position: 'relative'
  },
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    height: 50,
  },
  commentInput: {
    flex: 0.75,
    padding: 10,
  },
  commentSubmit: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    comments: state.comments,
    error: state.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
      },
      dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments);

