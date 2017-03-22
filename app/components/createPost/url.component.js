import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Text,
  TouchableHighlight
} from 'react-native';
import { globalStyles, blue } from '../../styles/global';
import * as utils from '../../utils';
import UrlPreview from './urlPreview.component';
import UserName from '../userNameSmall.component';
import UserSearchComponent from './userSearch.component';
import PostBody from './../post/postBody.component';
import PostInfo from './../post/postInfo.component';

let styles;
const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

export default class UrlComponent extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      inputHeight: 100,
    };
    this.setMention = this.setMention.bind(this);
    this.previousPostLength = 0;
    this.scrollHeight = 0;
    this.contentHeight = 0;
  }

  componentDidMount() {
    if (this.props.postUrl) {
      this.createPreview(this.props.postUrl);
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.postUrl !== next.postUrl && next.postUrl) {
      this.createPreview(next.postUrl);
    }
  }

  setMention(user) {
    let postBody = this.props.postBody.replace(this.mention, '@' + user._id);
    this.props.actions.setCreaPostState({ postBody });
    this.props.actions.setUserSearch([]);
    this.input.focus();
  }

  processInput(postBody, doneTyping) {
    let length = postBody ? postBody.length : 0;

    if (doneTyping) postBody = this.props.postBody;
    let lines = postBody.split('\n');
    let words = [];
    lines.forEach(line => words = words.concat(line.split(' ')));

    let shouldParseUrl = false;

    let prevLength = this.props.postBody.length || 0;

    if (length - prevLength > 1) shouldParseUrl = true;
    if (postBody[postBody.length - 1] == ' ') shouldParseUrl = true;
    if (postBody[postBody.length - 1] == '\n') shouldParseUrl = true;

    if (!this.props.postUrl && shouldParseUrl) {
      let postUrl = words.find(word => URL_REGEX.test(word));
      if (postUrl) {
        this.props.actions.setCreaPostState({ postUrl });
      }
    }

    let lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    let bodyTags = words.map((word) => {
      if (word.match(/^#\S+/g)) {
        return word.replace('#', '').replace(/(,|\.|!|\?)\s*$/, '');
      }
      return null;
    })
    .filter(el => el !== null);

    let bodyMentions = words.map((word) => {
      if (word.match(/^@\S+/g)) {
        return word.replace('@', '').replace(/(,|\.|!|\?)\s*$/, '');
      }
      return null;
    })
    .filter(el => el !== null);

    if (this.props.urlPreview && this.props.postUrl && postBody.match(this.props.postUrl)) {
      postBody = postBody.replace(`${this.props.postUrl}`, '').trim();
    }

    this.props.actions.setCreaPostState({ postBody, bodyTags, bodyMentions });
  }

  createPreview(postUrl) {
    utils.post.generatePreview(postUrl)
    .then((results) => {
      if (results) {
        let newBody = this.props.postBody.replace(`${postUrl}`, '').trim();
        let tags = [];
        if (results.tags) {
          tags = results.tags.split(',');
        }
        let keywords = [...tags];
        let pKeywords = [];
        keywords.forEach(k => {
          pKeywords = [...k.trim().split(';'), ...pKeywords];
        });
        pKeywords = pKeywords.map(tag => tag.trim());

        tags = tags.map(tag => tag.trim().toLowerCase().replace(/\s/g, ''));
        let pTags = [];
        tags.forEach(tag => {
          pTags = [...pTags, ...tag.split(';')];
        });
        pTags = pTags.map(tag => tag.trim().toLowerCase().replace(/\s/g, ''));

        this.props.actions.setCreaPostState({
          postBody: newBody,
          domain: results.domain,
          postUrl: results.url,
          articleTags: pTags,
          keywords: pKeywords,
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

  render() {
    let input;
    let repostBody;

    // let maxHeight = this.contentHeight;
    // if (this.props.share) maxHeight = 170;

    if (this.props.repost) {
      repostBody = (
        <View style={{ marginBottom: 30 }}>
          <PostInfo post={this.props.repost} />
          <PostBody short post={this.props.repost} />
        </View>);
    }

    let urlPlaceholder = 'Article URL.';

    if (this.props.postUrl) {
      urlPlaceholder = 'Add your own commentary';
    }

    let userHeader = null;

    if (this.props.user && !this.props.share) {
      userHeader = (
        <View style={styles.createPostUser}>
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
      userSearch = (<UserSearchComponent
        setSelected={this.setMention}
        users={this.props.users.search}
      />);
    }

    let addP = null;

    if (this.props.urlPreview && this.props.urlPreview.description && this.props.postBody === '') {
      addP = (
        <TouchableHighlight
          style={styles.postButton}
          onPress={() =>
            this.props.actions.setCreaPostState({ postBody: '"' + this.props.urlPreview.description + '"' })
          }
        >
          <Text style={[styles.font12, styles.active]}>Add text from link</Text>
        </TouchableHighlight>
      );
    }

    input = (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{
          flex: 1,
          backgroundColor: '#ffffff'
        }}
      >
        <View
          keyboardShouldPersistTaps={'always'}
          ref={c => this.scrollView = c}
          onLayout={(e) => {
            this.scrollHeight = e.nativeEvent.layout.height;
          }}
          onContentSizeChange={(contentWidth, contentHeight) => {
            this.contentHeight = contentHeight;
          }}
          style={{
            flex: 1,
            paddingHorizontal: 10,
          }}
        >
          {userHeader}

          <View
            style={[
              this.props.urlPreview ? styles.innerBorder : null,
              this.props.share ? styles.noBorder : null,
              { flex: 1 }]
            }
          >
            <TextInput
              ref={(c) => { this.input = c; }}
              style={[styles.font15, styles.createPostInput, styles.flex1]}
              placeholder={urlPlaceholder}
              multiline
              onChangeText={postBody => this.processInput(postBody, false)}
              onBlur={() => this.processInput(null, true)}
              value={this.props.postBody}
              returnKeyType={'default'}
              autoFocus
              keyboardShouldPersistTaps={false}
              onContentSizeChange={(event) => {
                let h = event.nativeEvent.contentSize.height;
                this.setState({
                  inputHeight: Math.max(100, h)
                });
              }}
            />
            {addP}
          </View>
          {userSearch}
          {repostBody}
          {this.props.postUrl && !this.props.users.search.length ?
            <UrlPreview size={'small'} {...this.props} actions={this.props.actions} /> :
            null
          }
        </View>
      </KeyboardAvoidingView>
    );

    return (
      input
    );
  }
}

const localStyles = StyleSheet.create({
  createPostUser: {
    height: 55,
  },
  postButton: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderColor: blue,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3
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

