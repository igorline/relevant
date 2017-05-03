import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  AlertIOS,
  TouchableHighlight
} from 'react-native';
import { globalStyles, fullHeight } from '../../styles/global';
import UserSearchComponent from '../createPost/userSearch.component';
import * as utils from '../../utils';
import TextBody from './textBody.component';

let styles;

class CommentInput extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderInput = this.renderInput.bind(this);
    this.renderUserSuggestions = this.renderUserSuggestions.bind(this);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.state = {};
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
      AlertIOS.alert('no comment');
    }
    let comment = this.state.comment.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '');
    let commentObj = {
      post: this.props.postId,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: this.props.auth.user._id
    };
    this.props.actions.createComment(this.props.auth.token, commentObj);
    this.props.actions.setUserSearch([]);
    this.setState({ comment: '' });
    this.textInput.blur();
    this.props.onFocus('new');
  }

  processInput(comment) {
    // let lines = comment.split('\n');
    // let words = [];
    // lines.forEach(line => words = words.concat(line.split(' ')));

    // console.log(comment)
    let words = utils.text.getWords(comment);

    let lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    this.commentTags = utils.text.getTags(words);
    this.commentMentions = utils.text.getMentions(words);
  }

  renderUserSuggestions() {
    let parentEl = null;
    if (this.props.users.search) {
      if (this.props.users.search.length) {
        parentEl = (
          <View
            style={{
              position: 'absolute',
              bottom: Math.min(100, this.state.inputHeight),
              left: 0,
              right: 0,
              // top: 0,
              maxHeight: this.top,
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#F0F0F0' }}
          >
            <UserSearchComponent
              style={{ paddingTop: 59 }}
              setSelected={this.setMention}
              users={this.props.users.search}
            />
          </View>
        );
      }
    }
    return parentEl;
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
        }}
        style={[
          styles.commentInputParent,
          { height: Math.min(100, this.state.inputHeight) }
        ]}
      >
        {this.renderUserSuggestions()}
        {inputImage}
        <TextInput
          ref={(c) => { this.textInput = c; }}
          style={[
            styles.commentInput,
            styles.font15,
            { lineHeight: 20 }
          ]}
          placeholder="Enter comment..."
          multiline
          onChangeText={(comment) => {
            this.processInput(comment, false);
            this.setState({ comment });
          }}
          // value={this.state.comment}
          returnKeyType="default"
          onFocus={this.props.onFocus}
          onContentSizeChange={(event) => {
            let h = event.nativeEvent.contentSize.height;
            this.setState({
              inputHeight: Math.max(50, h)
            });
          }}
        >
          <TextBody showAllMentions>{this.state.comment}</TextBody>
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
    marginLeft: 5,
  }
});

styles = { ...localStyles, ...globalStyles };

