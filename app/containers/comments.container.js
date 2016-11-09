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

require('../publicenv');

let styles;

class Comments extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      comment: null,
      visibleHeight: Dimensions.get('window').height,
      scrollView: ScrollView,
      scrollToBottomY: null,
    };
    this.renderRow = this.renderRow.bind(this);
    this.elHeight = null;
    this.loading = false;
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
      this.loading = false;
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
    this.props.actions.archiveComments(this.id);
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
    let commentObj = {
      post: this.id,
      text: this.state.comment,
      user: this.props.auth.user._id
    };
    this.props.actions.createComment(this.props.auth.token, commentObj);
    this.setState({ comment: null });
  }

  renderRow(rowData) {
    return (
      <Comment {...this.props} comment={rowData} />
    );
  }

  reload() {
    this.loading = true;
    this.props.actions.getComments(this.id, 0);
  }

  loadMore() {
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
        onEndReachedThreshold={500}
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
            refreshing={this.loading}
            onRefresh={this.reload}
            tintColor="#000000"
            colors={['#000000', '#000000', '#000000']}
            progressBackgroundColor="#ffffff"
          />
        }
      />);
    }

    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
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
        <CustomSpinner visible={!this.dataSource} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  commentInput: {
    height: 50,
    flex: 0.75,
    padding: 10,
  },
  commentSubmit: {
    flex: 0.25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    comments: state.comments,
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

