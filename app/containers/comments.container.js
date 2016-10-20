'use strict';

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
  ListView
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Comment from '../components/comment.component';
import * as postActions from '../actions/post.actions';

const localStyles = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
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

const styles = { ...localStyles, ...globalStyles };

class Comments extends Component {
  constructor(props, context) {
    super(props, context);
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      comment: null,
      visibleHeight: Dimensions.get('window').height - 120,
      elHeight: null,
      scrollView: ScrollView,
      scrollToBottomY: null,
      dataSource: ds.cloneWithRows([]),
    };
  }

  componentDidMount() {
    const self = this;
    console.log(self)
    if (self.props.posts.selectedPostId) self.props.actions.getComments(self.props.posts.selectedPostId);
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUpdate(next) {
    const self = this;
    if (next.posts.comments !== self.props.posts.comments) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      self.setState({ dataSource: ds.cloneWithRows(next.posts.comments) });
    }
  }

  componentDidUpdate(prev) {
    const self = this;
    if (!prev) return;
    if (prev.posts.comments && prev.posts.comments !== self.props.posts.comments) {
      setTimeout(() => {
        self.scrollToBottom();
      }, 500);
    }
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillHide(e) {
    this.setState({ visibleHeight: Dimensions.get('window').height - 120 });
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 60;
    this.setState({ visibleHeight: newSize });
  }

  scrollToBottom() {
    const self = this;
    if (self.props.posts.comments.length < 7) return;
    let scrollDistance = self.state.scrollToBottomY - self.state.elHeight;
    self.state.scrollView.scrollTo({ x: 0, y: scrollDistance, animated: true });
  }

  createComment() {
    const self = this;
    let commentObj = {
      post: self.props.posts.selectedPostId,
      text: self.state.comment,
      user: self.props.auth.user._id
    };
    self.props.actions.createComment(self.props.auth.token, commentObj);
    self.setState({ comment: null });
  }

  renderRow(rowData) {
    const self = this;
    return (
      <Comment styles={styles} {...self.props} comment={rowData} />
    );
  }

  render() {
    const self = this;
    let comments = [];
    let commentsEl = null;

    if (self.props.posts.comments) {
      comments = self.props.posts.comments;
      commentsEl = comments.map((comment, i) => {
        return (<Comment key={i} styles={styles} {...self.props} comment={comment} />);
      });
    }

    return (
      <View style={[{ height: self.state.visibleHeight, backgroundColor: 'white' }]}>
        <ScrollView
          ref={(scrollView) => { self.state.scrollView = scrollView; }}
          onContentSizeChange={(height, width) => { self.state.scrollToBottomY = width; }}
          onLayout={(e) => { self.state.elHeight = e.nativeEvent.layout.height }}
        >
          {commentsEl}
        </ScrollView>
        <View style={[styles.commentInputParent]}>
          <TextInput
            style={[styles.commentInput, styles.font15]}
            placeholder={'Enter comment...'}
            multiline={false}
            onChangeText={(comment) => this.setState({ comment })}
            value={self.state.comment}
            returnKeyType={'done'}
          />
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.commentSubmit]}
            onPress={() => self.createComment()}
          >
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    posts: state.posts,
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...postActions }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments);
