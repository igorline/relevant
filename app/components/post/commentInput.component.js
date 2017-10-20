import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Alert,
  TouchableHighlight,
  Platform
} from 'react-native';
import { globalStyles, greyText, mainPadding } from '../../styles/global';
import * as utils from '../../utils';
import TextBody from './textBody.component';

let styles;

class CommentInput extends Component {
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
    let comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
    this.props.actions.setUserSearch([]);
  }

  createComment() {
    if (!this.state.comment || !this.state.comment.length) {
      return Alert.alert('no comment');
    }

    let comment = this.state.comment.trim();
    let commentObj = {
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

    this.props.actions.createComment(this.props.auth.token, commentObj)
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
    let words = utils.text.getWords(comment);

    let lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    this.commentTags = utils.text.getTags(words);
    this.commentMentions = utils.text.getMentions(words);
    this.props.updatePosition({
      inputHeight: this.state.inputHeight, top: this.top
    });
  }

  renderInput() {
    if (!this.props.editing) {
      let inputImage = null;
      if (this.props.auth.user.image) {
        let imageUrl = this.props.auth.user.image;
        inputImage = (<Image style={styles.inputImage} source={{ uri: imageUrl }} />);
      }
      return (<View
        onLayout={(e) => {
          this.top = e.nativeEvent.layout.y;
          this.props.updatePosition({
            inputHeight: this.state.inputHeight,
            top: this.top,
          });
        }}
        style={[
          styles.commentInputParent,
          { height: Math.min(this.state.inputHeight, 120) }
        ]}
      >
        {inputImage}
        <TextInput
          ref={(c) => { this.textInput = c; }}
          underlineColorAndroid={'transparent'}
          textAlignVertical={'top'}
          style={[
            styles.commentInput,
            styles.font15,
            {
              flex: 1,
              lineHeight: 18,
              paddingTop: Platform.OS === 'ios' ? 10 : 15,
              // height: 'auto',
              // maxHeight: 120,
              // minHeight: 50,
              flexDirection: 'row',
              alignItems: 'center',
              height: Math.min(this.state.inputHeight, 120),
            }
          ]}
          placeholder="Enter reply..."
          placeholderTextColor={greyText}
          multiline
          onChangeText={(comment) => {
            this.processInput(comment, false);
            this.setState({ comment });
          }}
          returnKeyType="default"
          onFocus={this.props.onFocus}
          onChange={(event) => {
            let h = event.nativeEvent.contentSize.height;
            this.setState({
              inputHeight: Math.max(50, h)
            });
          }}

          // fix for android enter bug!
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (this.okToSubmit) {
              let comment = this.state.comment;
              comment += '\n';
              this.processInput(comment, false);
              this.setState({ comment });
              return this.okToSubmit = false;
            }
            return this.okToSubmit = true;
          }}
        >
          <TextBody style={{ flex: 1 }} showAllMentions>{this.state.comment}</TextBody>
        </TextInput>
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.commentSubmit]}
          onPress={() => this.createComment()}
        >
          <Text style={[styles.font15, styles.active]}>Submit</Text>
        </TouchableHighlight>
      </View>);
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
    marginLeft: mainPadding,
  }
});

styles = { ...localStyles, ...globalStyles };

