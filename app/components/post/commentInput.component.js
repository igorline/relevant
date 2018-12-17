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
import { globalStyles, greyText, mainPadding } from '../../styles/global';
import * as utils from '../../utils';
import TextBody from './textBody.component';

let styles;

class CommentInput extends Component {
  static propTypes = {
    actions: PropTypes.object,
    postId: PropTypes.string,
    auth: PropTypes.object,
    onFocus: PropTypes.func,
    scrollToBottom: PropTypes.func,
    updatePosition: PropTypes.func,
    editing: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.renderInput = this.renderInput.bind(this);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.state = {
      inputHeight: 50
    };
  }

  componentWillUnmount() {
    this.props.actions.setUserSearch([]);
  }

  setMention(user) {
    const comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
    this.props.actions.setUserSearch([]);
  }

  createComment() {
    if (!this.state.comment || !this.state.comment.length) {
      return Alert.alert('no comment');
    }

    const comment = this.state.comment.trim();
    const commentObj = {
      post: this.props.postId,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: this.props.auth.user._id
    };

    this.setState({ comment: '', inputHeight: 50 });
    this.textInput.blur();
    this.props.onFocus('new');
    this.props.actions.setUserSearch([]);

    return this.props.actions
    .createComment(this.props.auth.token, commentObj)
    .then(success => {
      if (!success) {
        this.setState({ comment, inputHeight: 50 });
        this.textInput.focus();
        return;
      }
      this.props.scrollToBottom();
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

  renderInput() {
    const { auth, editing } = this.props;
    const { user } = auth;
    const { inputHeight } = this.state;
    if (!editing) {
      let inputImage = null;
      if (user.image) {
        const imageUrl = user.image;
        inputImage = <Image style={styles.inputImage} source={{ uri: imageUrl }} />;
      }
      return (
        <View
          onLayout={e => {
            this.top = e.nativeEvent.layout.y;
            this.props.updatePosition({
              inputHeight,
              top: this.top
            });
          }}
          style={[styles.commentInputParent, { height: Math.min(inputHeight, 120) }]}
        >
          {inputImage}
          <TextInput
            ref={c => {
              this.textInput = c;
            }}
            underlineColorAndroid={'transparent'}
            textAlignVertical={'top'}
            style={[
              styles.commentInput,
              styles.font15,
              {
                flex: 1,
                lineHeight: 18,
                paddingTop: 15,
                maxHeight: 120,
                minHeight: 50,
                flexDirection: 'row',
                alignItems: 'center',
                height: Math.min(inputHeight, 120)
              }
            ]}
            placeholder="Enter reply..."
            placeholderTextColor={greyText}
            multiline
            onChangeText={comment => {
              this.processInput(comment, false);
              this.setState({ comment });
            }}
            onContentSizeChange={event => {
              const h = event.nativeEvent.contentSize.height;
              this.setState({
                inputHeight: Math.max(50, h)
              });
            }}
            returnKeyType="default"
            onFocus={this.props.onFocus}
            // fix for android enter bug!
            blurOnSubmit={false}
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
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>
        </View>
      );
    }
    return null;
  }

  render() {
    return this.renderInput();
  }
}

export default CommentInput;

const localStyles = StyleSheet.create({
  inputImage: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginLeft: mainPadding
  }
});

styles = { ...localStyles, ...globalStyles };
