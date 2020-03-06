import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableHighlight,
  Platform,
  ScrollView,
  InteractionManager,
  ActionSheetIOS,
  Alert,
  Keyboard
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, mainPadding, greyText, borderGrey } from 'app/styles/global';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NavigationEvents } from 'react-navigation';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as userActions from 'modules/user/user.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';

import { getTextData, getWords } from 'app/utils/text';
import Avatar from 'modules/user/avatarbox.component';
import TextBody from 'modules/text/mobile/textBody.component';
import RNBottomSheet from 'react-native-bottom-sheet';
import { colors } from 'styles';

import UserSearchComponent from './userSearch.component';
import UrlPreview from './urlPreview.component';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

let styles;

class UrlComponent extends Component {
  static propTypes = {
    postUrl: PropTypes.string,
    createPreview: PropTypes.object,
    postBody: PropTypes.string,
    urlPreview: PropTypes.object,
    share: PropTypes.bool,
    actions: PropTypes.object,
    repost: PropTypes.object,
    edit: PropTypes.bool,
    users: PropTypes.object,
    user: PropTypes.object,
    tags: PropTypes.array,
    disableUrl: PropTypes.bool,
    navigation: PropTypes.object
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
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.tags.length) this.props.actions.getParentTags();
    });
  }

  componentDidUpdate(prev) {
    const { createPreview, postUrl, navigation } = this.props;

    if (!navigation.isFocused()) {
      this.input.blur();
      Keyboard.dismiss();
    }
    if (createPreview !== prev.createPreview && postUrl) {
      this.createPreview(postUrl);
      this.input.focus();
    }
  }

  componentWillUnmount() {
    this.input.blur();
  }

  removeUrlPreview = () => {
    this.props.actions.setCreatePostState({
      urlPreview: null,
      postUrl: null,
      disableUrl: true
    });
  };

  enableUrlPreview = () => {
    const { postBody } = this.props;
    this.props.actions.setCreatePostState({ disableUrl: false });
    setTimeout(() => this.processInput(postBody), 1);
  };

  previewMenu = () => {
    if (this.props.edit || this.props.repost) return;
    ActionSheet.showActionSheetWithOptions(
      {
        options: ['Remove Url', 'Cancel'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            this.removeUrlPreview();
            break;
          default:
        }
      }
    );
  };

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
    const postBody = this.props.postBody.replace(this.mention, '@' + user.handle);
    this.props.actions.setCreatePostState({ postBody });
    this.props.actions.setUserSearch([]);
    this.input.focus();
  }

  processInput(postBody, doneTyping) {
    const { disableUrl, postUrl } = this.props;
    const length = postBody ? postBody.length : 0;

    if (doneTyping) postBody = this.props.postBody;
    let shouldParseUrl = false;
    const prevLength = this.props.postBody.length || 0;
    if (length - prevLength > 1) shouldParseUrl = true;

    // eslint-disable-next-line
    if (postBody[postBody.length - 1] == ' ') shouldParseUrl = true;
    // eslint-disable-next-line
    if (postBody[postBody.length - 1] == '\n') shouldParseUrl = true;

    const { tags, mentions, url } = getTextData(postBody);

    if (!disableUrl && !postUrl && shouldParseUrl) {
      const newUrl = url && url.url;
      if (newUrl) {
        this.props.actions.setCreatePostState({ postUrl: newUrl });
        this.createPreview(newUrl);
      }
    }

    const bodyTags = tags;
    const bodyMentions = mentions;

    const words = getWords(postBody);
    const lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else this.props.actions.setUserSearch([]);

    this.props.actions.setCreatePostState({ postBody, bodyTags, bodyMentions });
  }

  createPreview = async postUrl => {
    try {
      const results = await this.props.actions.generatePreviewServer(postUrl);
      if (!results) throw new Error('Unable to generate preview for url');

      this.props.actions.setCreatePostState({
        domain: results.domain,
        postUrl: results.url,
        inputUrl: postUrl,
        keywords: results.keywords,
        postTags: results.tags,
        articleAuthor: results.articleAuthor,
        shortText: results.shortText,
        urlPreview: {
          image: results.image,
          title: results.title ? results.title : 'Untitled',
          description: results.description
        }
      });
    } catch (err) {
      this.props.actions.setCreatePostState({ postUrl: null });
      Alert.alert(err.message);
    }
  };

  render() {
    const { disableUrl, postUrl, postBody, navigation } = this.props;
    let urlPlaceholder = 'Article URL.';
    if (postUrl) {
      urlPlaceholder = 'Add your own commentary';
    }
    if (this.props.repost) {
      urlPlaceholder = 'Add a comment';
    }

    let userHeader = null;

    if (this.props.user && !this.props.share && !this.props.repost) {
      userHeader = (
        <View style={styles.createPostUser}>
          <View style={[styles.innerBorder, { paddingVertical: 10 }]}>
            <Avatar
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
      !this.props.repost
    ) {
      addP = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={styles.postButton}
          onPress={() =>
            this.props.actions.setCreatePostState({
              postBody: postBody + '\n>"' + this.props.urlPreview.description + '"'
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
      postBody === '' &&
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

    return (
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        ref={c => (this.scrollView = c)}
        style={{
          flex: 1,
          paddingHorizontal: mainPadding,
          backgroundColor: colors.white
        }}
        contentContainerStyle={{ flexGrow: 1, height: 'auto', minHeight: 260 }}
      >
        <NavigationEvents
          onDidBlur={() => {
            this.input && this.input.blur();
            Keyboard.dismiss();
          }}
          onWillBlur={() => {
            this.input && this.input.blur();
            Keyboard.dismiss();
          }}
        />
        {userHeader}
        <View style={[{ flex: 1, marginTop: 8 }]}>
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
            autoFocus={navigation.isFocused()}
            underlineColorAndroid={'transparent'}
            placeholder={urlPlaceholder}
            placeholderTextColor={greyText}
            multiline
            clearButtonMode={'while-editing'}
            onChangeText={_postBody => {
              this.processInput(_postBody, false);
            }}
            onBlur={() => this.processInput(null, true)}
            returnKeyType={'default'}
            onFocus={() => null}
            keyboardShouldPersistTaps={'never'}
            disableFullscreenUI
            textAlignVertical={'top'}
            onSubmitEditing={() => {
              if (this.okToSubmit) {
                this.processInput(postBody + '\n', false);
                return (this.okToSubmit = false);
              }
              return (this.okToSubmit = true);
            }}
          >
            <TextBody showAllMentions>{postBody}</TextBody>
          </TextInput>
          {addP}
          {tipCTA}
        </View>
        {userSearch}
        {disableUrl && postBody !== '' && (
          <Text
            onPress={this.enableUrlPreview}
            style={{ color: colors.blue, position: 'absolute', bottom: 16, right: 0 }}
          >
            Enable Link Preview
          </Text>
        )}
        {postUrl && !this.props.users.search.length && !this.props.repost ? (
          <View style={{ marginVertical: 8 }}>
            <UrlPreview
              remove
              {...this.props}
              size={'small'}
              urlMenu={this.previewMenu}
            />
          </View>
        ) : null}
      </ScrollView>
    );
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

function mapStateToProps(state) {
  return {
    user: state.auth.user,
    users: state.user,
    postUrl: state.createPost.postUrl,
    createPreview: state.createPost.createPreview,
    postBody: state.createPost.postBody,
    urlPreview: state.createPost.urlPreview,
    repost: state.createPost.repost,
    tags: state.tags.parentTags,
    disableUrl: state.createPost.disableUrl
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...createPostActions,
        ...tagActions,
        ...userActions,
        ...tooltipActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UrlComponent);
