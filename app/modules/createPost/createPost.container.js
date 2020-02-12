import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import RichText from 'modules/text/web/richText.component';
import get from 'lodash/get';
import ReactGA from 'react-ga';
import { colors, sizing } from 'styles';

import * as navigationActions from 'modules/navigation/navigation.actions';
import * as userActions from 'modules/user/user.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as postActions from 'modules/post/post.actions';
import * as tagActions from 'modules/tag/tag.actions';
import { alert, text } from 'app/utils';

import { View, Button, Divider, BodyText, LinkFont, SmallText } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';

import AvatarBox from 'modules/user/avatarbox.component';
import PostInfo from 'modules/post/postinfo.component';
import TagInput from 'modules/createPost/web/TagInput.component';
import SelectTags from 'modules/createPost/web/selectTags.component';
import styled from 'styled-components/primitives';

const urlPlaceholder = "What's relevant?  Paste article URL.";
const textPlaceholder =
  'Add your commentary, opinion, summary or a relevant quote from the article';

const PasteTextFromLink = styled(SmallText)`
  position: absolute;
  right: ${sizing(1.5)};
  bottom: ${sizing(1.5)};
`;

class CreatePostContainer extends Component {
  static propTypes = {
    tags: PropTypes.object,
    actions: PropTypes.object,
    userSearch: PropTypes.array,
    createPost: PropTypes.object,
    // modal: PropTypes.bool,
    auth: PropTypes.object,
    close: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    community: PropTypes.object,
    screenSize: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBodyChange = this.handleBodyChange.bind(this);
    this.parseBody = this.parseBody.bind(this);
    this.createPreview = this.createPreview.bind(this);
    this.addTextFromLink = this.addTextFromLink.bind(this);
    this.setCategory = this.setCategory.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.createPost = this.createPost.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.clearPost = this.clearPost.bind(this);
    this.selectTags = this.selectTags.bind(this);
    this.state = {
      body: '',
      category: '',
      domain: null,
      urlPreview: null,
      loadingPreview: false,
      selectedTags: [],
      tags: null,
      url: null,
      mentions: null,
      failedUrl: null,
      submitting: false
    };
  }

  componentWillMount() {
    this.stateFromReducer();
  }

  componentDidMount() {
    if (!this.props.tags || !this.props.tags.parentTags.length) {
      this.props.actions.getParentTags();
    }
    this.setState({ submitting: false });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.userSearch !== this.props.userSearch) {
      this.setState({ userSearchIndex: -1 });
    }
  }

  componentDidUpdate(newProps, oldState) {
    if (oldState.body !== this.state.body) {
      this.parseBody();
    }
  }

  selectTags(tag) {
    if (!tag || !tag.length) return;
    if (typeof tag === 'string') tag = [tag];
    let { selectedTags } = this.state;
    selectedTags = [...new Set([...selectedTags, ...tag])];
    this.setState({ selectedTags });
  }

  clearPost() {
    this.props.actions.clearCreatePost();
    this.clearUrl();
    this.stateFromReducer();
  }

  clearUrl() {
    this.setState({
      url: null,
      postUrl: null,
      urlPreview: null,
      loadingPreview: false
    });
  }

  componentWillUnmount() {
    this.updateReducer();
  }

  stateFromReducer() {
    const props = this.props.createPost;
    this.setState({
      ...props,
      body: props.postBody || '',
      category: props.postCategory,
      tags: props.allTags
    });
    this.parseBody(this.state);
  }

  updateReducer() {
    const allTags = this.state.tags
      ? this.state.tags.concat(this.state.selectedTags)
      : [];
    const tags = Array.from(new Set(allTags));

    const state = {
      ...this.state,
      postBody: this.state.body,
      postCategory: this.state.category,
      allTags: tags,
      postImage: this.state.urlPreview ? this.state.urlPreview.image : null
    };
    this.props.actions.setCreatePostState(state);
  }

  validateInput() {
    if (!this.state.selectedTags.length) {
      this.setSate({ validate: 'Please select at least one topic' });
      return 'Please select at least one topic';
    }
    if (!this.state.body || !this.state.body.trim().length) {
      this.setState({ validate: 'Please write something' });
      return 'Can not create empty post';
    }
    return true;
  }

  createPost = async () => {
    this.setState({ submitting: true });
    const { auth, close, actions, history, location, createPost } = this.props;
    const {
      selectedTags,
      postUrl,
      urlPreview,
      category,
      mentions,
      domain,
      channel,
      title
    } = this.state;

    let { tags, body } = this.state;
    try {
      const validate = this.validateInput();
      if (validate !== true) {
        throw new Error(validate);
      }
      const allTags = tags.concat(selectedTags);
      tags = Array.from(new Set(allTags));

      body = body.replace(/&nbsp;/gi, '');

      let newPost = {
        url: postUrl || postUrl,
        tags,
        body,
        title: urlPreview ? urlPreview.title : title,
        description: urlPreview ? urlPreview.description : null,
        category,
        image: urlPreview ? urlPreview.image : null,
        mentions,
        domain,
        channel
      };

      if (createPost.edit) {
        newPost = { ...createPost.editPost, ...newPost };
        const success = await actions.editPost(newPost);
        if (success) {
          this.clearPost();
          history.push(location.pathname);
          if (close) close();
        }
        return;
      }

      newPost = await actions.submitPost(newPost);

      if (!newPost) {
        this.setState({ submitting: false });
        return;
      }

      close && close();
      this.clearPost();

      history.push(`/${auth.community}/new/`);
      actions.refreshTab('discover');

      ReactGA.event({
        category: 'User',
        action: 'Created a Post'
      });
    } catch (err) {
      // TODO error handling
      alert.browserAlerts.alert(err.message);
    }
    this.setState({ submitting: false });
  };

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  handleBodyChange(body, data) {
    if (body !== this.state.body) {
      this.setState({ ...data, body });
    }
  }

  parseBody() {
    if (
      this.state.url &&
      !this.state.postUrl &&
      this.state.shouldParseUrl &&
      this.state.postUrl !== this.state.url
    ) {
      this.createPreview();
    }
  }

  addTextFromLink() {
    const description = '"' + text.stripHTML(this.state.urlPreview.description) + '"';
    this.setState({
      body: description
    });
  }

  setCategory(category) {
    this.setState({ category });
    this.props.actions.setPostCategory(category);
  }

  createPreview() {
    const { url } = this.state;
    const { auth } = this.props;
    // better logic?
    if (this.state.loadingPreview) return;

    const postUrl = url;
    this.setState({
      body: this.state.body.replace(postUrl, '').trim(),
      loadingPreview: true,
      urlPreview: {
        loading: true
      }
    });

    this.props.actions.generatePreviewServer(postUrl).then(results => {
      if (results && results.url) {
        let imageURL = results.image;
        if (imageURL && imageURL.indexOf(', ')) {
          imageURL = imageURL.split(', ')[0];
        }
        this.setState({
          domain: results.domain,
          postUrl: results.url,
          url: results.url,
          loadingPreview: false,
          keywords: results.keywords,
          postTags: results.tags,
          urlPreview: {
            ...results,
            image: imageURL,
            title: results.title || 'Untitled',
            loading: false,
            embeddedUser: auth.user,
            tags: []
          },
          linkPreview: {
            ...results,
            image: imageURL
          }
        });
      } else {
        this.setState({ failedUrl: this.state.url, loadingPreview: false });
      }
    });
  }

  renderPreview() {
    if (!this.state.urlPreview) return null;
    const { auth, screenSize } = this.props;
    return (
      <div style={{ position: 'relative' }}>
        <PostInfo
          small
          preview={!!screenSize}
          auth={auth}
          screenSize={screenSize}
          close={this.clearUrl.bind(this)}
          post={this.state.urlPreview}
          link={this.state.linkPreview}
        />
        <SmallText display="flex" justify="flex-end" fdirection="row">
          <a onClick={this.clearUrl.bind(this)} className="removeUrl">
            remove url
          </a>
        </SmallText>
      </div>
    );
  }

  handleInput = e => this.setState({ [e.target.name]: e.target.value });

  handleCheckbox = e => this.setState({ [e.target.name]: e.target.checked });

  render() {
    const placeholder = this.state.urlPreview ? textPlaceholder : urlPlaceholder;
    const { body, url, submitting, channel, title } = this.state;
    const { community, auth } = this.props;
    const articleTags = this.state.keywords;
    let communityTags = [];
    if (community) {
      const activeCommunity = get(community.communities, community.active, {}) || {};
      communityTags = get(activeCommunity, 'topics', []) || [].map(t => t._id);
    }
    const allTags = [].concat(articleTags, communityTags);
    const isAdmin = auth.user && auth.user.role === 'admin';

    const submitDisabled =
      submitting || !this.state.selectedTags.length || !body || !body.trim().length;

    const chatEnabled = false;

    return (
      <View>
        <View display="flex" fdirection="row" align="center">
          <AvatarBox user={auth.user} size={4} />
        </View>

        {channel && (
          <Input
            onChange={this.handleInput}
            value={title}
            name="title"
            mt={2}
            type="text"
            placeholder="Title"
          />
        )}

        <View mt={2}>
          <RichText
            body={this.state.body}
            placeholder={placeholder}
            onChange={this.handleBodyChange}
            onBlur={() => {
              if (!this.state.body.length && !this.state.postUrl) {
                this.setState({ active: false });
              }
            }}
          />
          <PasteTextFromLink c={colors.blue}>
            {this.state.urlPreview &&
              this.state.body === '' &&
              this.state.urlPreview.description && (
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    this.addTextFromLink();
                  }}
                >
                  Paste article description
                </a>
              )}
          </PasteTextFromLink>
        </View>

        <View mt={[3, 2]}>{this.renderPreview()}</View>

        {body || url ? (
          <View mt={[3, 2]}>
            <TagInput
              selectedTags={this.state.selectedTags}
              selectTag={this.selectTags}
              deselectTag={tag => {
                let { selectedTags } = this.state;
                selectedTags = selectedTags.filter(t => t !== tag);
                this.setState({ selectedTags });
              }}
              placeholderText={
                !this.state.selectedTags.length ? 'Please add at least one tag' : ''
              }
            />
            <View mt={[4, 2]}>
              <SelectTags
                text={'Suggested tags'}
                tags={allTags}
                selectedTags={this.state.selectedTags}
                selectTag={this.selectTags}
                deselectTag={tag => {
                  let { selectedTags } = this.state.selectedTags;
                  selectedTags = selectedTags.filter(t => t !== tag);
                  this.setState({ selectedTags });
                }}
              />
            </View>
            <Divider mt={[4, 2]} />
          </View>
        ) : null}

        <View mt={2} fdirection="row" justify="space-between">
          {isAdmin && chatEnabled && (
            <View fdirection="row" align={'center'} alignself={'center'}>
              <input
                checked={channel}
                type="checkbox"
                name={'channel'}
                onChange={this.handleCheckbox}
              />
              <BodyText ml={0.5}>This is a chat channel</BodyText>
            </View>
          )}
          <View fdirection="row" flex={1} justify="flex-end" align="center">
            <LinkFont mr={3} onClick={this.clearPost}>
              Clear
            </LinkFont>

            <Button
              onClick={() => !submitDisabled && this.createPost()}
              disabled={submitDisabled}
              ml={2}
            >
              {this.props.createPost.edit ? 'Update Post' : 'Create Post'}
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    createPost: state.createPost,
    auth: state.auth,
    users: state.user,
    tags: state.tags,
    userSearch: state.user.search,
    community: state.community,
    screenSize: state.navigation.screenSize
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions,
        ...createPostActions,
        ...postActions,
        ...userActions,
        ...tagActions
      },
      dispatch
    )
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CreatePostContainer)
);
