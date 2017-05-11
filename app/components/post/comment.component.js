import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActionSheetIOS,
  AlertIOS,
  TouchableHighlight
} from 'react-native';
import { globalStyles } from '../../styles/global';
import TextEdit from '../common/textEdit.component';
import UserName from '../userNameSmall.component';
import { numbers, text as textUtil } from '../../utils';
import TextBody from './textBody.component';

let moment = require('moment');

let styles;

class Comment extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      buttons: [
        'Edit',
        'Delete',
        'Cancel'
      ],
      destructiveIndex: 1,
      cancelIndex: 2,
      editedText: null,
      editing: false,
      height: 0
    };
    this.singleComment = null;
    this.deleteComment = this.deleteComment.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.editComment = this.editComment.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
    this.scrollToComment = this.scrollToComment.bind(this);
  }

  componentDidMount() {
    if (this.props.comment.text) {
      let text = this.props.comment.text;
      this.setState({ editedText: text });
    }
    this.setSelected = this.setSelected.bind(this);
  }

  saveEdit(text) {
    let comment = this.props.comment;
    if (comment.text === text) {
      return this.editComment();
    }
    let words = textUtil.getWords(text);
    let mentions = textUtil.getMentions(words);
    let originalText = comment.text;
    comment.text = text;
    comment.mentions = mentions;
    this.setState({ editing: false, editedText: text });
    this.props.actions.updateComment(comment)
    .then((results) => {
      if (results) {
        this.setState({ editing: false, editedText: null });
        AlertIOS.alert('Comment updated');
      } else {
        comment.text = originalText;
        this.setState({ editing: true, editedText: text });
      }
    });
  }

  showActionSheet() {
    ActionSheetIOS.showActionSheetWithOptions({
      options: this.state.buttons,
      cancelButtonIndex: this.state.cancelIndex,
      destructiveButtonIndex: this.state.destructiveIndex,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          this.editComment();
          break;
        case 1:
          this.deleteComment();
          break;
        default:
          return;
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.editing !== this.state.editing) {
      this.props.parentEditing(nextState.editing);
    }
  }

  scrollToComment(animated) {
    this.singleComment.measure((fx, fy, width, height, px, py) => {
      let num = fy;
      this.props.parentEditing(true, num, animated);
    });
  }

  deleteComment() {
    const self = this;
    this.props.actions.deleteComment(
      self.props.auth.token,
      self.props.comment._id,
      self.props.comment.post
    );
  }

  setTag(tag) {
    this.props.actions.selectTag({ _id: tag.replace('#', '') });
    this.props.navigator.changeTab('discover');
  }

  setSelected(user) {
    if (!user) return;
    if (this.props.scene && this.props.scene.id === user._id) return;
    this.props.actions.goToProfile(user);
  }

  editComment() {
    this.setState({ editedText: this.props.comment.text });
    this.setState({ editing: !this.state.editing });
  }

  render() {
    let comment = this.props.comment;
    let user = this.props.auth.user;

    if (!comment) return null;
    let postTime = moment(comment.createdAt);
    let timestamp = numbers.timeSince(postTime);
    let optionsEl = null;
    let editingEl = null;
    let owner = false;
    let commentUserId = null;
    let textBody;

    if (this.state.editing) {
      editingEl = (<TextEdit
        style={[styles.darkGray, styles.editingInput]}
        text={this.state.editedText || comment.text}
        toggleFunction={this.editComment}
        saveEditFunction={this.saveEdit}
        onFocus={() => this.scrollToComment(true)}
        onContentSizeChange={(e) => {
          let h = e.nativeEvent.contentSize.height;
          if (h !== this.height) {
            this.height = h;
            this.scrollToComment(true);
          }
        }}
      />);
    }

    if (comment.user && typeof comment.user === 'object') {
      commentUserId = comment.user._id;
    } else {
      commentUserId = comment.user;
    }

    if (user && user._id && user._id === commentUserId) {
      owner = true;
    }

    if (owner) {
      optionsEl = (<View
        style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}
      >
        <TouchableHighlight
          underlayColor={'transparent'}
          onPress={this.showActionSheet}
        >
          <Text style={styles.dots}>...</Text>
        </TouchableHighlight>
      </View>);
    }

    textBody = (
      <TextBody
        {...this.props}
        style={styles.commentBodyText}
        post={comment}
        body={comment.text}
      />
    );

    return (
      <View
        ref={(c) => { this.singleComment = c; }}
        style={[styles.commentContainer]}
      >
        <View style={styles.commentHeader}>
          <UserName
            repost={comment.repost}
            size={'small'}
            user={{
              image: comment.embeddedUser.image,
              name: comment.embeddedUser.name,
              _id: comment.user
            }}
            setSelected={this.setSelected}
          />
          <Text style={[{ fontSize: 12 }, styles.timestampGray]}>{timestamp}</Text>
        </View>
        <View style={{ paddingLeft: 33, paddingRight: 10 }}>
          {this.state.editing ? editingEl : textBody}
        </View>
        {optionsEl}
      </View>
    );
  }
}

export default Comment;

const localStyles = StyleSheet.create({
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  commentContainer: {
    padding: 15,
  },
  commentAvatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
  commentBodyText: {
    // lineHeight: 20,
    fontFamily: 'Georgia',
    fontSize: 30 / 2,
    lineHeight: 42 / 2,
    paddingTop: 5,
  }
});

styles = { ...localStyles, ...globalStyles };

