import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as navigationActions from 'modules/navigation/navigation.actions';
import RichText from 'modules/text/web/richText.component';
import get from 'lodash.get';

import * as userActions from 'modules/user/user.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as postActions from 'modules/post/post.actions';
import * as tagActions from 'modules/tag/tag.actions';
import { alert, text } from 'app/utils';

import { View, Button, Divider } from 'modules/styled/uni';
import { colors, sizing } from 'app/styles';

import UAvatar from 'modules/user/UAvatar.component';
import RStat from 'modules/stats/rStat.component';
import PostInfo from 'modules/post/postinfo.component';
import CreatePostTeaser from 'modules/createPost/web/createPostTeaser.component';
import TagInput from 'modules/createPost/web/TagInput.component';
import SelectTags from 'modules/createPost/web/selectTags.component';
import styled from 'styled-components/primitives';

const urlPlaceholder = "What's relevant?  Paste article URL.";
const textPlaceholder =
  'Add your commentary, opinion, summary or a relevant quote from the article';

const PasteTextFromLink = styled(View)`
  right: ${sizing(1.5)};
  top: ${sizing(-3)};
`;

class CreatePostContainer extends Component {
  static propTypes = {
    tags: PropTypes.object,
    actions: PropTypes.object,
    userSearch: PropTypes.array,
    createPost: PropTypes.object,
    modal: PropTypes.bool,
    auth: PropTypes.object,
    close: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    community: PropTypes.object
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
      failedUrl: null
    };
  }

  componentWillMount() {
    this.stateFromReducer();
  }

  componentDidMount() {
    if (!this.props.tags || !this.props.tags.parentTags.length) {
      this.props.actions.getParentTags();
    }
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
    if (!this.state.body && !this.state.postUrl) {
      this.setState({ validate: 'Please paste article link' });
      return 'Can not create empty post';
    }
    return true;
  }

  async createPost() {
    const { auth, close, actions, history, location, createPost } = this.props;
    const { selectedTags, postUrl, urlPreview, category, mentions, domain } = this.state;
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
        title: urlPreview ? urlPreview.title : null,
        description: urlPreview ? urlPreview.description : null,
        category,
        image: urlPreview ? urlPreview.image : null,
        mentions,
        domain
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

      if (close) close();
      if (newPost) {
        this.clearPost();
      }

      history.push(`/${auth.community}/new/`);
      actions.refreshTab('discover');

      // Analytics.logEvent('newPost', {
      //   viaShare: this.props.share
      // });
    } catch (err) {
      // TODO error handling
      alert.browserAlerts.alert(err.message);
    }
  }

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
    return (
      <div style={{ position: 'relative' }}>
        <PostInfo
          small
          close={this.clearUrl.bind(this)}
          post={this.state.urlPreview}
          link={this.state.linkPreview}
        />
        <View display="flex" justify="flex-end" fdirection="row">
          <a onClick={this.clearUrl.bind(this)} className="removeUrl">
            remove url
          </a>
        </View>
      </div>
    );
  }

  render() {
    const placeholder = this.state.urlPreview ? textPlaceholder : urlPlaceholder;
    const { body, url } = this.state;
    const { community } = this.props;
    const articleTags = this.state.keywords;
    let communityTags = [];
    if (community) {
      const activeCommunity = get(community.communities, community.active, {}) || {};
      communityTags = get(activeCommunity, 'topics', []) || [].map(t => t._id);
    }
    const allTags = [].concat(articleTags, communityTags);

    if (!this.state.active && !this.props.modal) {
      return (
        <CreatePostTeaser
          user={this.props.auth.user}
          onClick={() => this.setState({ active: true })}
        />
      );
    }
    return (
      <View>
        <View display="flex" fdirection="row" align="center">
          <UAvatar user={this.props.auth.user} size={4} />
          <RStat user={this.props.auth.user} size={2} ml={1.5} />
        </View>

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
          <PasteTextFromLink display="flex" fdirection="row" justify="flex-end">
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

        <View mt={3}>{this.renderPreview()}</View>

        {body || url ? (
          <View mt={3}>
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
            <View mt={4}>
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
            <Divider mt={4} />
          </View>
        ) : null}
        <View display="flex" fdirection="row" mt={2} justify="flex-end">
          <Button c={colors.black} bg={colors.white} onClick={this.clearPost}>
            Clear
          </Button>

          <Button
            onClick={() => this.createPost()}
            disabled={
              !this.state.selectedTags.length ||
              (!this.state.body.length && !this.state.postUrl)
            }
            ml={2}
            bb={1}
          >
            {this.props.createPost.edit ? 'Update Post' : 'Create Post'}
          </Button>
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
    community: state.community
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
