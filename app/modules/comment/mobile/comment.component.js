import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActionSheetIOS,
  TouchableHighlight,
  Platform,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import { globalStyles, darkGrey } from 'app/styles/global';
import TextEdit from 'modules/text/mobile/textEdit.component';
import { text as textUtil } from 'app/utils';
import TextBody from 'modules/text/mobile/textBody.component';
import PostInfo from 'modules/post/mobile/postInfo.component';
import PostButtons from 'modules/post/mobile/postButtons.component';

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
    parentEditing: PropTypes.func,
    navigator: PropTypes.object,
    scrollToComment: PropTypes.func,
    auth: PropTypes.object,
    myPostInv: PropTypes.object,
    singlePost: PropTypes.bool,
    users: PropTypes.object,
    focusInput: PropTypes.func,
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
    const { body } = this.props.comment;
    if (body) {
      this.setState({ editedText: body });
    }
    this.setSelected = this.setSelected.bind(this);
  }

  saveEdit(body) {
    const { comment } = this.props;
    if (comment.body === body) return this.editComment();
    const words = textUtil.getWords(body);
    const mentions = textUtil.getMentions(words);
    const originalText = comment.body;
    comment.body = body;
    comment.mentions = mentions;
    this.setState({ editing: false, editedText: body });
    return this.props.actions.updateComment(comment)
    .then(results => {
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
    // const { params } = this.props.navigation.state;
    // if (params && params.id === user._id) return;
    this.props.actions.goToProfile(user);
  }

  editComment() {
    if (!this.state.editing) {
      this.props.scrollToComment();
    }
    this.setState({
      editedText: this.props.comment.body,
      editing: !this.state.editing
    });
  }

  render() {
    const { comment, auth } = this.props;
    const { user } = auth;

    if (!comment) return null;
    let optionsEl = null;
    let editingEl = null;
    let owner = false;
    let commentUserId = null;

    if (this.state.editing) {
      editingEl = (
        <TextEdit
          style={[styles.darkGrey, styles.editingInput]}
          text={this.state.editedText || comment.body}
          toggleFunction={this.editComment}
          saveEditFunction={this.saveEdit}
          onChange={e => {
            const h = e.nativeEvent.contentSize.height;
            if (h !== this.height) {
              this.height = h;
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

    const textBody = (
      <TextBody {...this.props} style={styles.commentBodyText} post={comment} body={comment.body} />
    );

    const myPostInv = this.props.myPostInv[comment._id];
    return (
      <View
        ref={c => {
          this.singleComment = c;
        }}
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
    color: darkGrey,
    fontFamily: 'Georgia',
    fontSize: 30 / 2,
    lineHeight: 42 / 2,
    paddingTop: 5
  }
});

styles = { ...localStyles, ...globalStyles };
