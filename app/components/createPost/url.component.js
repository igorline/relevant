import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Text,
  TouchableHighlight
} from 'react-native';
import { globalStyles, blue, fullWidth } from '../../styles/global';
import * as utils from '../../utils';
import UrlPreview from './urlPreview.component';
import UserName from '../userNameSmall.component';
import UserSearchComponent from './userSearch.component';
import PostBody from './../post/postBody.component';
import PostInfo from './../post/postInfo.component';
import TextBody from './../post/textBody.component';

var Video = require('react-native-video').default;

let styles;
const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

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
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
  }

  componentDidMount() {
    if (this.props.postUrl) {
      this.createPreview(this.props.postUrl);
    }
    setTimeout(() => this.initTooltips('shareTip'), 1000);
  }

  componentWillReceiveProps(next) {
    if (this.props.createPreview !== next.createPreview && next.postUrl) {
      // console.log(this.props.postUrl);
      // console.log(next.postUrl);
      this.createPreview(next.postUrl);
    }
  }

  initTooltips(name) {
    this.props.actions.setTooltipData({
      name,
      toggle: () => this.toggleTooltip(this[name], name)
    });
  }

  toggleTooltip(parentEl, name) {
    if (!parentEl) return;
    parentEl.measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
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
    // let lines = postBody.split('\n');
    // let words = [];
    // lines.forEach(line => words = words.concat(line.split(' ')));

    let words = utils.text.getWords(postBody);

    let shouldParseUrl = false;

    let prevLength = this.props.postBody.length || 0;

    if (length - prevLength > 1) shouldParseUrl = true;
    if (postBody[postBody.length - 1] == ' ') shouldParseUrl = true;
    if (postBody[postBody.length - 1] == '\n') shouldParseUrl = true;

    if (!this.props.postUrl && shouldParseUrl) {
      let postUrl;
      let possibleUrls = words.filter(word => URL_REGEX.test(word));
      postUrl = possibleUrls[0];

      // pick the 'best' url (ex: when copying and pasting website domain)
      possibleUrls.forEach(u => {
        if (!u) return null;
        if ((u.match('http://') || u.match('https://')) && !postUrl.match('http')) {
          return postUrl = u;
        }
        if (u.length > postUrl.length) postUrl = u;
        return null;
      });
      if (postUrl) {
        this.props.actions.setCreaPostState({ postUrl });
        this.createPreview(postUrl);
      }
    }

    let lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    let bodyTags = utils.text.getTags(words);

    let bodyMentions = utils.text.getMentions(words);

    if (this.props.urlPreview && this.props.postUrl && postBody.match(this.props.postUrl)) {
      postBody = postBody.replace(`${this.props.postUrl}`, '').trim();
    }

    this.props.actions.setCreaPostState({ postBody, bodyTags, bodyMentions });
  }

  createPreview(postUrl) {
    utils.post.generatePreviewServer(postUrl)
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
          articleAuthor: results.articleAuthor,
          shortText: results.shortText,
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
        <View style={{ flex: 0, height: 120, width: fullWidth - 20 }}>
          <PostInfo post={this.props.repost} />
          <PostBody preview post={this.props.repost} />
        </View>);
    }

    let urlPlaceholder = 'Article URL.';

    if (this.props.postUrl) {
      urlPlaceholder = 'Add your own commentary';
    }
    if (this.props.repost) {
      urlPlaceholder = 'Add a comment';
    }

    let userHeader = null;

    if (this.props.user && !this.props.share && !this.props.repost) {
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

    if (this.props.urlPreview && this.props.urlPreview.description && this.props.postBody === '' && !this.props.repost) {
      addP = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={styles.postButton}
          onPress={() =>
            this.props.actions.setCreaPostState({ postBody: '"' + this.props.urlPreview.description + '"' })
          }
        >
          <Text style={[styles.font12, styles.active]}>Add text from link</Text>
        </TouchableHighlight>
      );
    }

    let width = 170;
    let tipCTA;
    if (!this.props.urlPreview && this.props.postBody === '' && !this.props.share) {
      tipCTA = (
        <TouchableHighlight
          ref={c => this.shareTip = c}
          underlayColor={'transparent'}
          style={[styles.postButtonShare]}
          onPress={() => this.toggleTooltip(this.shareTip, 'shareTip')}
        >
          <Text
            style={[styles.font12, styles.active, { textAlign: 'center' }]}
          >
            How to post from Chrome, Safari & other apps
          </Text>
        </TouchableHighlight>
      );
    }

    let tip = (
      <View style={styles.videoTip}>
        <View style={{ flex: 0.5, paddingRight: 10 }}>
          <Text style={styles.textP}>1. Tap on share icon</Text>
          <Text style={styles.textP}>2. Tap on 'More'</Text>
          <Text style={styles.textP}>3. Find and toggle Relevant app</Text>
          <Text style={styles.textP}>4. Rearrange Relevant icon to a convenient place</Text>
        </View>
        <View
          style={{ width, height: width, overflow: 'hidden' }}
        >
          <Video
            resizeMode={'contain'}
            source={require('../../assets/images/shareTip.mp4')}
            style={{ width, height: width * 16 / 9, bottom: 0, position: 'absolute' }}
            repeat
          />
        </View>
      </View>
    );

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
              clearButtonMode={'while-editing'}
              onChangeText={postBody => this.processInput(postBody, false)}
              onBlur={() => this.processInput(null, true)}
              // value={this.props.postBody}
              returnKeyType={'default'}
              autoFocus
              keyboardShouldPersistTaps={'never'}
              onContentSizeChange={(event) => {
                let h = event.nativeEvent.contentSize.height;
                this.setState({
                  inputHeight: Math.max(100, h)
                });
              }}
            >
              <TextBody showAllMentions>
                {this.props.postBody}
              </TextBody>
            </TextInput>
            {addP}
            {tipCTA}
          </View>
          {userSearch}
          {repostBody}
          {this.state.tip ? null : null}
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
  textP: {
    flex: 0,
    marginBottom: 10,
  },
  videoTip: {
    borderColor: 'lightgrey',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10
  },
  createPostUser: {
    height: 55,
  },
  postButtonShare: {
    // alignSelf: 'center',
    // width: 200,
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    // borderColor: blue,
    // borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3
  },
  postButton: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 5,
    // borderColor: blue,
    // borderWidth: StyleSheet.hairlineWidth,
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

