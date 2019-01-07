import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableHighlight,
  Platform,
  ScrollView
} from 'react-native';
import PropTypes from 'prop-types';
import {
  globalStyles,
  mainPadding,
  fullWidth,
  greyText,
  borderGrey
} from 'app/styles/global';
import * as utils from 'app/utils';
import UserName from 'modules/user/mobile/avatar.component';
import PostBody from 'modules/post/mobile/postBody.component';
import PostInfo from 'modules/post/mobile/postInfo.component';
import TextBody from 'modules/text/mobile/textBody.component';
import UserSearchComponent from './userSearch.component';
import UrlPreview from './urlPreview.component';

let styles;
const URL_REGEX = new RegExp(
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/
);

export default class UrlComponent extends Component {
  static propTypes = {
    postUrl: PropTypes.string,
    share: PropTypes.bool,
    createPreview: PropTypes.object,
    actions: PropTypes.object,
    postBody: PropTypes.string,
    urlPreview: PropTypes.object,
    repost: PropTypes.object,
    users: PropTypes.object,
    user: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.setMention = this.setMention.bind(this);
    this.previousPostLength = 0;
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
  }

  componentDidMount() {
    if (this.props.postUrl) {
      this.createPreview(this.props.postUrl);
    }
    setTimeout(() => this.initTooltips('shareTip'), 1000);
    if (!this.props.share) this.input.focus();
  }

  componentWillReceiveProps(next) {
    if (this.props.createPreview !== next.createPreview && next.postUrl) {
      this.createPreview(next.postUrl);
      this.input.focus();
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
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  }

  setMention(user) {
    const postBody = this.props.postBody.replace(this.mention, '@' + user._id);
    this.props.actions.setCreaPostState({ postBody });
    this.props.actions.setUserSearch([]);
    this.input.focus();
  }

  processInput(postBody, doneTyping) {
    const length = postBody ? postBody.length : 0;

    if (doneTyping) postBody = this.props.postBody;
    const words = utils.text.getWords(postBody);

    let shouldParseUrl = false;

    const prevLength = this.props.postBody.length || 0;

    if (length - prevLength > 1) shouldParseUrl = true;

    // eslint-disable-next-line
    if (postBody[postBody.length - 1] == ' ') shouldParseUrl = true;
    // eslint-disable-next-line
    if (postBody[postBody.length - 1] == '\n') shouldParseUrl = true;

    if (!this.props.postUrl && shouldParseUrl) {
      let postUrl;
      const possibleUrls = words.filter(word => URL_REGEX.test(word));
      postUrl = possibleUrls[0];

      // pick the 'best' url (ex: when copying and pasting website domain)
      possibleUrls.forEach(u => {
        if (!u) return null;
        if ((u.match('http://') || u.match('https://')) && !postUrl.match('http')) {
          return (postUrl = u);
        }
        if (u.length > postUrl.length) postUrl = u;
        return null;
      });
      if (postUrl) {
        this.props.actions.setCreaPostState({ postUrl });
        this.createPreview(postUrl);
      }
    }

    const lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    const bodyTags = utils.text.getTags(words);

    const bodyMentions = utils.text.getMentions(words);

    if (
      this.props.urlPreview &&
      this.props.postUrl &&
      postBody.match(this.props.postUrl)
    ) {
      postBody = postBody.replace(`${this.props.postUrl}`, '').trim();
    }

    this.props.actions.setCreaPostState({ postBody, bodyTags, bodyMentions });
  }

  createPreview(postUrl) {
    utils.post.generatePreviewServer(postUrl).then(results => {
      if (results) {
        const newBody = this.props.postBody
          ? this.props.postBody.replace(`${postUrl}`, '').trim()
          : '';
        let tags = [];
        if (results.tags) {
          tags = results.tags.split(',');
        }
        const keywords = [...tags];
        let pKeywords = [];
        keywords.forEach(k => {
          pKeywords = [...k.trim().split(';'), ...pKeywords];
        });
        pKeywords = pKeywords.map(tag => tag.trim());

        tags = tags.map(tag =>
          tag
          .trim()
          .toLowerCase()
          .replace(/\s/g, '')
        );
        let pTags = [];
        tags.forEach(tag => {
          pTags = [...pTags, ...tag.split(';')];
        });
        pTags = pTags.map(tag =>
          tag
          .trim()
          .toLowerCase()
          .replace(/\s/g, '')
        );

        this.props.actions.setCreaPostState({
          postBody: newBody,
          domain: results.domain,
          postUrl: results.url,
          articleTags: pTags,
          keywords: results.keywords,
          articleAuthor: results.articleAuthor,
          shortText: results.shortText,
          urlPreview: {
            image: results.image,
            title: results.title ? results.title : 'Untitled',
            description: results.description
          }
        });
      } else {
        this.props.actions.setCreaPostState({ postUrl: null });
      }
    });
  }

  render() {
    let repostBody;

    if (this.props.repost) {
      repostBody = (
        <View style={{ flex: 0, width: fullWidth - 20, paddingBottom: 20 }}>
          <PostInfo preview post={this.props.repost} users={this.props.users} />
          <PostBody preview post={this.props.repost} />
        </View>
      );
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
      userSearch = (
        <View style={{ flex: 1, maxHeight: 220 }}>
          <UserSearchComponent
            setSelected={this.setMention}
            users={this.props.users.search}
          />
        </View>
      );
    }

    let addP = null;

    if (
      this.props.urlPreview &&
      this.props.urlPreview.description &&
      this.props.postBody === '' &&
      !this.props.repost
    ) {
      addP = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={styles.postButton}
          onPress={() =>
            this.props.actions.setCreaPostState({
              postBody: '"' + this.props.urlPreview.description + '"'
            })
          }
        >
          <Text style={[styles.font12, styles.active]}>Add text from link</Text>
        </TouchableHighlight>
      );
    }

    let tipCTA;
    if (
      Platform.OS === 'ios' &&
      !this.props.urlPreview &&
      this.props.postBody === '' &&
      !this.props.share
    ) {
      tipCTA = (
        <TouchableHighlight
          ref={c => (this.shareTip = c)}
          underlayColor={'transparent'}
          style={[styles.postButtonShare]}
          onPress={() => this.toggleTooltip(this.shareTip, 'shareTip')}
        >
          <Text style={[styles.font12, styles.active, { textAlign: 'center' }]}>
            How to post from Chrome, Safari & other apps
          </Text>
        </TouchableHighlight>
      );
    }

    const input = (
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        ref={c => (this.scrollView = c)}
        style={{
          flex: 1,
          paddingHorizontal: mainPadding
        }}
        contentContainerStyle={{ flexGrow: 1, height: 'auto', minHeight: 260 }}
      >
        {userHeader}
        <View style={[{ flex: 1 }]}>
          <TextInput
            ref={c => {
              this.input = c;
            }}
            style={[
              { flex: 1 },
              styles.font15,
              styles.createPostInput,
              { maxHeight: 280 }
            ]}
            underlineColorAndroid={'transparent'}
            placeholder={urlPlaceholder}
            placeholderTextColor={greyText}
            multiline
            clearButtonMode={'while-editing'}
            onChangeText={postBody => {
              this.processInput(postBody, false);
            }}
            onBlur={() => this.processInput(null, true)}
            returnKeyType={'default'}
            onFocus={() => null}
            keyboardShouldPersistTaps={'never'}
            disableFullscreenUI
            textAlignVertical={'top'}
            // fix for android enter bug!
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (this.okToSubmit) {
                let { postBody } = this.props;
                postBody += '\n';
                this.processInput(postBody, false);
                return (this.okToSubmit = false);
              }
              return (this.okToSubmit = true);
            }}
          >
            <TextBody showAllMentions>{this.props.postBody}</TextBody>
          </TextInput>
          {addP}
          {tipCTA}
        </View>
        {userSearch}
        {repostBody}
        {this.props.postUrl && !this.props.users.search.length && !this.props.repost ? (
          <UrlPreview size={'small'} {...this.props} actions={this.props.actions} />
        ) : null}
      </ScrollView>
    );

    return input;
  }
}

const localStyles = StyleSheet.create({
  textP: {
    flex: 0,
    marginBottom: 10
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
    height: 55
  },
  postButtonShare: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 3
  },
  postButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 3
  },
  innerBorder: {
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: borderGrey
  },
  noBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});

styles = { ...localStyles, ...globalStyles };