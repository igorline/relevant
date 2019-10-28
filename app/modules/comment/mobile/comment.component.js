import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ActionSheetIOS,
  TouchableHighlight,
  Platform,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import { globalStyles } from 'app/styles/global';
import TextEdit from 'modules/text/mobile/textEdit.component';
import { text as textUtil } from 'app/utils';
import TextBody from 'modules/text/mobile/textBody.component';
import PostInfo from 'modules/post/mobile/postInfo.component';
import { View, Image } from 'modules/styled/uni';
import { colors } from 'styles';

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
      singlePost
    } = this.props;
    if (!comment) return null;
    const { editing } = this.state;
    const owner = auth.user && auth.user._id === user._id;

    const editingEl = editing && (
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

    const optionsEl = owner && (
      <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
        <TouchableHighlight underlayColor={'transparent'} onPress={this.showActionSheet}>
          <Text style={styles.dots}>...</Text>
        </TouchableHighlight>
      </View>
    );

    const textBody = (
      <View mt={2} mb={1}>
        <TextBody
          {...this.props}
          style={styles.commentaryText}
          post={comment}
          body={comment.body}
        />
      </View>
    );

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
          <View mt={2} fdirection={'row'} align={'center'} justify={'space-between'}>
            <PostInfo
              post={comment}
              actions={actions}
              auth={auth}
              singlePost={singlePost}
              delete={this.deleteComment}
              edit={this.editComment}
              user={user}
            />
            {optionsEl}
          </View>

          <View mt={1}>{this.state.editing ? editingEl : textBody}</View>

          {renderButtons()}
        </View>
      </View>
    );
  }
}

export default Comment;

const localStyles = StyleSheet.create({
  commentaryText: {
    fontFamily: 'Georgia',
    fontSize: 36 / 2,
    lineHeight: 54 / 2,
    color: colors.black
  }
});

styles = { ...localStyles, ...globalStyles };
