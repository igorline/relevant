import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ActionSheetIOS,
  AlertIOS,
  TouchableHighlight
} from 'react-native';
import { globalStyles } from '../styles/global';
import UserName from './userNameSmall.component';
import UserSearchComponent from './createPost/userSearch.component';

let moment = require('moment');

let styles;

class CommentInput extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderInput = this.renderInput.bind(this);
    this.renderUserSuggestions = this.renderUserSuggestions.bind(this);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.state = {
    }
  }

  renderUserSuggestions() {
    let parentEl = null;
    let usersArr = null;
    if (this.props.users.search) {
      if (this.props.users.search.length) {
        parentEl = (<View style={{ padding: 5, position: 'absolute', bottom: Math.min(100, this.state.inputHeight) , left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
          <UserSearchComponent setSelected={this.setMention} users={this.props.users.search} />
        </View>)
      }
    }
    return parentEl;
  }

  setMention(user) {
    let comment = this.state.comment.replace(this.mention, '@' + user.name);
    this.setState({ comment });
    this.props.actions.setUserSearch([]);
  }

  createComment() {
    if (!this.state.comment.length) {
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
    this.setState({ comment: '' });
    this.textInput.blur();
  }

  processInput(comment) {
    let lines = comment.split('\n');
    let words = [];
    lines.forEach(line => words = words.concat(line.split(' ')));

    let lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    }
    else this.props.actions.setUserSearch([]);

    this.commentTags = words.map((word) => {
      if (word.match(/^#\S+/g)) {
        return word.replace('#', '').replace(/(,|\.)\s*$/, '');
      }
      return null;
    })
    .filter(el => el !== null);

    this.commentMentions = words.map((word) => {
      if (word.match(/^@\S+/g)) {
        return word.replace('@', '').replace(/(,|\.)\s*$/, '');
      }
      return null;
    })
    .filter(el => el !== null);
  }


  renderInput() {
    if (!this.props.editing) {
      return (<View
        style={[
          styles.commentInputParent,
          { height: Math.min(100, this.state.inputHeight) }
        ]}
      >
        {this.renderUserSuggestions()}
        <TextInput
          ref={(c) => { this.textInput = c; }}
          style={[
            styles.commentInput,
            styles.font15
          ]}
          placeholder="Enter comment..."
          multiline
          onChangeText={comment => { this.processInput(comment, false); this.setState({ comment }); }}
          value={this.state.comment}
          returnKeyType="default"
          onContentSizeChange={(event) => {
            let h = event.nativeEvent.contentSize.height;
            this.setState({
              inputHeight: Math.max(50, h)
            });
          }}
        />
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

  componentDidMount() {
  }

  render() {
    return this.renderInput()
  }
}

export default CommentInput;

const localStyles = StyleSheet.create({

});

styles = { ...localStyles, ...globalStyles };

