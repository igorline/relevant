import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Alert,
  TouchableHighlight
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, greyText, mainPadding } from 'app/styles/global';
import * as utils from 'app/utils';
import TextBody from 'modules/text/mobile/textBody.component';

let styles;
const DEFAULT_INPUT_HEIGHT = 25;

class CommentInput extends Component {
  static propTypes = {
    actions: PropTypes.object,
    parentPost: PropTypes.object,
    parentComment: PropTypes.object,
    auth: PropTypes.object,
    onFocus: PropTypes.func,
    scrollToBottom: PropTypes.func,
    updatePosition: PropTypes.func,
    editing: PropTypes.bool,
    placeholder: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.state = {
      inputHeight: DEFAULT_INPUT_HEIGHT
    };
  }

  componentWillUnmount() {
    this.props.actions.setUserSearch([]);
  }

  setMention(user) {
    const comment = this.state.comment.replace(this.mention, '@' + user.handle);
    this.setState({ comment });
    this.props.actions.setUserSearch([]);
  }

  createComment() {
    const {
      parentPost,
      parentComment,
      auth,
      actions,
      onFocus,
      scrollToBottom
    } = this.props;
    if (!this.state.comment || !this.state.comment.length) {
      return Alert.alert('no comment');
    }

    const comment = this.state.comment.trim();
    const commentObj = {
      parentPost: parentPost._id,
      parentComment: parentComment ? parentComment._id : null,
      linkParent: parentPost.type === 'link' ? parentPost._id : null,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: auth.user._id
    };

    this.setState({ comment: '', inputHeight: DEFAULT_INPUT_HEIGHT });
    this.textInput.blur();
    onFocus('new');
    actions.setUserSearch([]);

    return this.props.actions.createComment(commentObj).then(success => {
      if (!success) {
        this.setState({ comment, inputHeight: DEFAULT_INPUT_HEIGHT });
        this.textInput.focus();
        return;
      }
      scrollToBottom();
    });
  }

  processInput(comment) {
    const words = utils.text.getWords(comment);

    const lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    this.commentTags = utils.text.getTags(words);
    this.commentMentions = utils.text.getMentions(words);
    this.props.updatePosition({
      inputHeight: this.state.inputHeight,
      top: this.top
    });
  }

  render() {
    const { auth, editing, placeholder } = this.props;
    const { user } = auth;
    const { inputHeight } = this.state;

    if (editing) return null;

    const inputImage = user && user.image && (
      <Image style={styles.inputImage} source={{ uri: user.image }} />
    );

    // let inputImage = null;
    // if (user && user.image) {
    //   const imageUrl = user.image;
    //   inputImage = <Image style={styles.inputImage} source={{ uri: imageUrl }} />;
    // }
    return (
      <View
        onLayout={e => {
          this.top = e.nativeEvent.layout.y;
          this.props.updatePosition({
            inputHeight,
            top: this.top
          });
        }}
        style={styles.commentInputParent}
      >
        {inputImage}
        <TextInput
          ref={c => {
            this.textInput = c;
          }}
          underlineColorAndroid={'transparent'}
          textAlignVertical={'top'}
          style={[styles.commentInput]}
          placeholder={placeholder || 'Enter reply...'}
          placeholderTextColor={greyText}
          multiline
          onChangeText={comment => {
            this.processInput(comment, false);
            this.setState({ comment });
          }}
          onContentSizeChange={event => {
            const h = event.nativeEvent.contentSize.height;
            this.setState({
              inputHeight: Math.max(DEFAULT_INPUT_HEIGHT, h)
            });
          }}
          returnKeyType="default"
          onFocus={this.props.onFocus}
          onSubmitEditing={() => {
            if (this.okToSubmit) {
              let { comment } = this.state;
              comment += '\n';
              this.processInput(comment, false);
              this.setState({ comment });
              return (this.okToSubmit = false);
            }
            return (this.okToSubmit = true);
          }}
        >
          <TextBody style={{ flex: 1 }} showAllMentions>
            {this.state.comment}
          </TextBody>
        </TextInput>
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.commentSubmit]}
          onPress={() => this.createComment()}
        >
          <Text style={[{ fontSize: 18, fontWeight: 'bold', color: 'white' }]}>
            {'\u2191'}
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

export default CommentInput;

const localStyles = StyleSheet.create({
  commentInput: {
    minHeight: 50,
    maxHeight: 200,
    paddingTop: 14,
    paddingBottom: 10,
    paddingLeft: 10,
    flex: 5,
    lineHeight: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    fontSize: 16
  },
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    backgroundColor: 'white'
  },
  inputImage: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginLeft: mainPadding
  },
  commentSubmit: {
    backgroundColor: '#0000FF',
    marginRight: 16,
    flex: 0,
    width: 25,
    height: 25,
    paddingHorizontal: 4,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

styles = { ...localStyles, ...globalStyles };
