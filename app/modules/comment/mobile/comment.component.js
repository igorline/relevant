import React, { Component } from 'react';
import { ActionSheetIOS, Platform, Alert } from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import TextEdit from 'modules/text/mobile/textEdit.component';
import { text as textUtil } from 'app/utils';
import CommentBody from 'modules/comment/commentBody';
import { colors } from 'styles';

import PostInfo from 'modules/post/mobile/postInfo.component';
import { View, Image, Box } from 'modules/styled/uni';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

class Comment extends Component {
  static propTypes = {
    comment: PropTypes.object,
    actions: PropTypes.object,
    parentEditing: PropTypes.func,
    scrollToComment: PropTypes.func,
    auth: PropTypes.object,
    singlePost: PropTypes.bool,
    user: PropTypes.object,
    nestingLevel: PropTypes.number,
    renderButtons: PropTypes.func,
    preview: PropTypes.bool
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
    this.deleteComment = this.deleteComment.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.editComment = this.editComment.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
  }

  componentDidMount() {
    const { body } = this.props.comment;
    if (body) this.setState({ editedText: body });
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
    return this.props.actions.updateComment(comment).then(results => {
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
    const {
      comment,
      auth,
      nestingLevel,
      renderButtons,
      user,
      actions,
      singlePost,
      preview
    } = this.props;

    if (!comment) return null;
    const { editing } = this.state;

    const editingEl = editing && (
      <TextEdit
        style={{ color: colors.black, fontSize: 16, lineHeight: 22 }}
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

    const textBody = <CommentBody preview={preview} comment={comment} />;

    return (
      <View
        ref={c => {
          this.singleComment = c;
        }}
        onLayout={() => null}
        mr={2}
        mb={2}
        ml={nestingLevel ? 2 + nestingLevel * 3 - 3 : 2}
        fdirection={'row'}
      >
        {nestingLevel ? (
          <Image
            h={2}
            w={2}
            mt={5}
            mr={1}
            resizeMode={'contain'}
            source={require('app/public/img/reply.png')}
          />
        ) : null}
        <View flex={1}>
          <Box mt={2} />
          <PostInfo
            post={comment}
            actions={actions}
            auth={auth}
            singlePost={singlePost}
            delete={this.deleteComment}
            edit={this.editComment}
            user={user}
          />

          <Box mt={2}>{this.state.editing ? editingEl : textBody}</Box>
          {renderButtons()}
        </View>
      </View>
    );
  }
}

export default Comment;
