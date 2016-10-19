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
import * as postActions from '../actions/post.actions';
import { globalStyles } from '../styles/global';
import Comment from '../components/comment.component';

require('../publicenv');

let styles;

class Comments extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      comment: null,
      visibleHeight: Dimensions.get('window').height - 120,
      scrollView: ScrollView,
      scrollToBottomY: null,
    };
    this.elHeight = null;
    this.createComment = this.createComment.bind(this);
  }

  componentDidMount() {
    if (this.props.comments.activePost) {
      this.props.actions.getComments(this.props.comments.activePost);
    }
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.dataSource = ds.cloneWithRows([]);
  }

  componentWillUpdate(next) {
    if (next.comments.comments !== this.props.comments.comments) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows([]);
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
    console.log("unmounting")
  }

  keyboardWillHide() {
    this.setState({ visibleHeight: Dimensions.get('window').height - 120 });
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 60;
    this.setState({ visibleHeight: newSize });
  }

  scrollToBottom() {
    if (this.props.comments.comments.length < 7) return;
    let scrollDistance = this.state.scrollToBottomY - this.elHeight;
    this.state.scrollView.scrollTo({ x: 0, y: scrollDistance, animated: true });
  }

  createComment() {
    let commentObj = {
      post: this.props.comments.activePost,
      text: this.state.comment,
      user: this.props.auth.user._id
    };
    this.props.actions.createComment(this.props.auth.token, commentObj);
    this.setState({ comment: null });
    this.scrollToBottom();
  }

  renderRow(rowData) {
    return (
      <Comment styles={styles} {...this.props} comment={rowData} />
    );
  }


  render() {
    let comments = [];
    let commentsEl = null;

    if (this.props.comments.comments) {
      comments = this.props.comments.comments;
      commentsEl = comments.map((comment, i) => (
        <Comment
          key={i}
          styles={styles}
          {...this.props}
          comment={comment}
        />));
    }

    return (
      <View style={[{ height: this.state.visibleHeight, backgroundColor: 'white' }]}>
        <ScrollView
          ref={(scrollView) => {
            this.state.scrollView = scrollView;
          }}
          onContentSizeChange={(height, width) => {
            this.state.scrollToBottomY = width;
          }}
          onLayout={(e) => {
            this.elHeight = e.nativeEvent.layout.height;
          }}
        >
          {commentsEl}
        </ScrollView>
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
            onPress={this.createComment}
          >
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

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

