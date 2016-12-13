import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  KeyboardAvoidingView
} from 'react-native';
import { globalStyles } from '../../styles/global';
import * as utils from '../../utils';
import UrlPreview from './urlPreview.component';
import UserName from '../userNameSmall.component';
import UserSearchComponent from './userSearch.component';


let styles;
const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

export default class UrlComponent extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      inputHeight: 55,
    };
    this.setMention = this.setMention.bind(this);
  }

  componentDidMount() {
    if (this.props.postUrl) {
      this.createPreview(this.props.postUrl);
    }
  }

  componentWillReceiveProps(next) {
    if (next.postUrl !== this.props.postUrl && next.postUrl) {
      this.createPreview(next.postUrl);
    }
  }

  setMention(user) {
    let bodyMentions = [...this.props.bodyMentions, user._id];
    let postBody = this.props.postBody.replace(this.mention, '@' + user.name);
    this.props.actions.setCreaPostState({ bodyMentions, postBody });
    this.props.actions.setUserSearch([]);
  }

  processInput(postBody, doneTyping) {
    if (doneTyping) postBody = this.props.postBody;
    let lines = postBody.split('\n');
    let words = [];
    lines.forEach(line => words = words.concat(line.split(' ')));

    if (!this.props.postUrl) {
      let postUrl = words.find(word => URL_REGEX.test(word.toLowerCase()));
      if (postUrl) {
        this.props.actions.setCreaPostState({ postUrl });
      }
    }

    let lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    }
    else this.props.actions.setUserSearch([]);

    let bodyTags = postBody.match(/#\S+/g);
    if (bodyTags) {
      bodyTags = bodyTags.map(tag =>
        tag.replace('#', '').replace(/(,|\.)\s*$/, ''));
    }

    if (this.props.urlPreview && this.props.postUrl && postBody.match(this.props.postUrl)) {
      postBody = postBody.replace(`${this.props.postUrl}`, '').trim();
    }

    this.props.actions.setCreaPostState({ postBody, bodyTags });
  }

  createPreview(postUrl) {
    utils.post.generatePreview(postUrl.toLowerCase())
    .then((results) => {
      if (results) {
        let newBody = this.props.postBody.replace(`${postUrl}`, '').trim();
        this.props.actions.setCreaPostState({
          postBody: newBody,
          domain: this.extractDomain(postUrl),
          urlPreview: {
            image: results.image,
            title: results.title ? results.title : 'Untitled',
            description: results.description,
          }
        });
      } else {
        this.props.actions.setCreaPostState({ postUrl: null });
      }
    });
  }

  extractDomain(url) {
    let domain;
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];

    let noPrefix = domain;

    if (domain.indexOf('www.') > -1) {
      noPrefix = domain.replace('www.', '');
    }
    return noPrefix;
  }

  render() {
    let input;
    let repostBody;

    let maxHeight = 170;
    if (this.props.share) maxHeight = 170;

    if (this.props.repostBody) {
      repostBody = (<Text>{this.props.repostBody}</Text>);
    }

    let urlPlaceholder = 'What’s relevant? Add a link to post commentary.';

    if (this.props.postUrl) urlPlaceholder = 'Why is this relevant?';

    let userHeader = null;

    if (this.props.user && !this.props.share) {
      userHeader = (
        <View style={styles.header}>
          <View style={styles.innerBorder}>
            <UserName
              style={styles.innerBorder}
              user={this.props.user}
              setSelected={() => null}
            />
          </View>
        </View>
      );
    }

    let userSearch = null;

    if (this.props.users.search && this.props.users.search.length) {
      userSearch = <UserSearchComponent setSelected={this.setMention} users={this.props.users.search} />;
    }

    input = (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{
          flex: 1,
          paddingLeft: 15,
          paddingRight: 15,
          backgroundColor: '#ffffff'
        }}
      >
        {repostBody}
        {userHeader}

        <View
          style={[
            styles.innerBorder,
            this.props.share ? styles.noBorder : null,
            { height: Math.min(maxHeight, this.state.inputHeight) }]
          }
        >
          <TextInput
            ref={(c) => { this.input = c; }}
            style={[styles.font15, styles.createPostInput, styles.flex1]}
            placeholder={urlPlaceholder}
            multiline
            onChangeText={postBody => this.processInput(postBody)}
            onBlur={() => this.processInput(null, true)}
            value={this.props.postBody}
            returnKeyType={'default'}
            autoFocus
            onContentSizeChange={(event) => {
              let h = event.nativeEvent.contentSize.height;
              this.setState({
                inputHeight: Math.max(55, h)
              });
            }}
          />
        </View>
        {userSearch}
        {this.props.urlPreview && !this.props.users.search.length ?
          <UrlPreview {...this.props} actions={this.props.actions} /> :
          null
        }
      </KeyboardAvoidingView>
    );

    return (
      input
    );
  }
}

const localStyles = StyleSheet.create({
  header: {
    height: 55,
  },
  innerBorder: {
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: 'grey'
  },
  noBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});

styles = { ...localStyles, ...globalStyles };

