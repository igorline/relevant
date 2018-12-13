import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActionSheetIOS,
  TouchableHighlight,
  Platform,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import { globalStyles, darkGrey } from '../../styles/global';
import TextEdit from '../common/textEdit.component';
import UserName from '../userNameSmall.component';
import { numbers, text as textUtil } from '../../utils';
import TextBody from './textBody.component';
import PostInfo from './postInfo.component';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';

const moment = require('moment');

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}
let styles;

class Comment extends Component {
  static propTypes = {
    comment: PropTypes.object,
    actions: PropTypes.object,
    parentEditing: PropTypes.bool,
    navigator: PropTypes.object,
    scene: PropTypes.object,
    scrollToComment: PropTypes.func,
    auth: PropTypes.object,
    myPostInv: PropTypes.array,
    singlePost: PropTypes.bool,
    users: PropTypes.array,
    focusInput: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      buttons: ['Edit', 'Delete', 'Cancel'],
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
  }

  componentDidMount() {
    if (this.props.comment.body) {
      const body = this.props.comment.body;
      this.setState({ editedText: body });
    }
    this.setSelected = this.setSelected.bind(this);
  }

  saveEdit(body) {
    const comment = this.props.comment;
    if (comment.body === body) {
      return this.editComment();
    }
    const words = textUtil.getWords(body);
    const mentions = textUtil.getMentions(words);
    const originalText = comment.body;
    comment.body = body;
    comment.mentions = mentions;
    this.setState({ editing: false, editedText: body });
    this.props.actions.updateComment(comment).then(results => {
      if (results) {
        this.setState({ editedText: null });
        Alert.alert('Comment updated');
      } else {
        comment.body = originalText;
        this.setState({ editing: true });
      }
    });
  }

  showActionSheet() {
    ActionSheet.showActionSheetWithOptions(
      {
        options: this.state.buttons,
        cancelButtonIndex: this.state.cancelIndex,
        destructiveButtonIndex: this.state.destructiveIndex
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            this.editComment();
            break;
          case 1:
            this.deleteComment();
            break;
          default:
        }
      }
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.editing !== this.state.editing) {
      this.props.parentEditing(nextState.editing);
    }
  }

  deleteComment() {
    this.props.actions.deleteComment(this.props.comment._id);
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
    if (!this.state.editing) {
      this.props.scrollToComment();
    }
    this.setState({ editedText: this.props.comment.body, editing: !this.state.editing });
  }

  render() {
    const comment = this.props.comment;
    const user = this.props.auth.user;

    if (!comment) return null;
    const postTime = moment(comment.createdAt);
    const timestamp = numbers.timeSince(postTime);
    let optionsEl = null;
    let editingEl = null;
    let owner = false;
    let commentUserId = null;
    let textBody;

    if (this.state.editing) {
      editingEl = (
        <TextEdit
          style={[styles.darkGrey, styles.editingInput]}
          text={this.state.editedText || comment.body}
          toggleFunction={this.editComment}
          saveEditFunction={this.saveEdit}
          // onFocus={() => this.props.scrollToComment()}
          onChange={e => {
            const h = e.nativeEvent.contentSize.height;
            if (h !== this.height) {
              this.height = h;
              // this.props.scrollToComment();
            }
          }}
        />
      );
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
      optionsEl = (
        <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
          <TouchableHighlight underlayColor={'transparent'} onPress={this.showActionSheet}>
            <Text style={styles.dots}>...</Text>
          </TouchableHighlight>
        </View>
      );
    }

    textBody = (
      <TextBody {...this.props} style={styles.commentBodyText} post={comment} body={comment.body} />
    );

    const myPostInv = this.props.myPostInv[comment._id];
    return (
      <View
        ref={c => {
          this.singleComment = c;
        }}
        // need this for measure to work on android
        onLayout={() => null}
        style={[styles.commentContainer]}
      >
        <View style={styles.commentHeader}>
          <PostInfo
            post={comment}
            actions={this.props.actions}
            auth={this.props.auth}
            singlePost={this.props.singlePost}
            delete={this.deleteComment}
            edit={this.editComment}
            users={this.props.users}
          />
          {optionsEl}
        </View>

        <View style={{ paddingLeft: 33, paddingRight: 10 }}>
          {this.state.editing ? editingEl : textBody}
        </View>

        <PostButtons
          comment
          post={comment}
          isComment
          // metaPost={this.props.metaPost}
          // tooltip={index === 0 ? this.props.tooltip : null}
          // tooltip={this.props.tooltip}
          actions={this.props.actions}
          auth={this.props.auth}
          myPostInv={myPostInv}
          focusInput={this.props.focusInput}
        />
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
    paddingBottom: 10
  },
  commentContainer: {
    padding: 15
  },
  commentAvatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 10
  },
  commentBodyText: {
    // lineHeight: 20,
    color: darkGrey,
    fontFamily: 'Georgia',
    fontSize: 30 / 2,
    lineHeight: 42 / 2,
    paddingTop: 5
  }
});

styles = { ...localStyles, ...globalStyles };
