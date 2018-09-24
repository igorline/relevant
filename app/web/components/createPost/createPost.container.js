import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as navigationActions from '../../../actions/navigation.actions';
// import ContentEditable from '../common/contentEditable.component';
import RichText from '../common/richText.component';

import * as userActions from '../../../actions/user.actions';
import * as createPostActions from '../../../actions/createPost.actions';
import * as postActions from '../../../actions/post.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as utils from '../../../utils';

import CreatePostTeaser from './createPostTeaser.component';
import AvatarBox from '../common/avatarbox.component';
import PostInfo from '../post/postinfo.component';
import TagInput from './TagInput.component';
import SelectTags from './selectTags.component';

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./createPost.css');
}

// eslint-disable-next-line no-useless-escape, max-len
const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,16}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

const urlPlaceholder = 'What\'s relevant?  Paste article URL.';
const textPlaceholder = 'Add your commentary, opinion, summary \nor a relevant quote from the article';

class CreatePostContainer extends Component {
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
    };
  }

  componentWillMount() {
    this.stateFromReducer();
  }

  componentDidMount() {
    // console.log(this.props)
    if (!this.props.tags || !this.props.tags.parentTags.length) this.props.actions.getParentTags();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.userSearch !== this.props.userSearch) {
      this.setState({ userSearchIndex: -1 });
    }
  }

  componentWillUpdate(newProps, newState) {
    if (newState.body !== this.state.body) {
      this.parseBody(newState);
      console.log(newState);
    }
  }

  selectTags(tag) {
    if (!tag || !tag.length) return;
    if (typeof tag === 'string') tag = [tag];
    let selectedTags = this.state.selectedTags;
    selectedTags = [...new Set([...selectedTags, ...tag])];
    this.setState({ selectedTags });
  }

  clearPost() {
    this.props.actions.clearCreatePost();
    this.stateFromReducer();
  }

  clearUrl() {
    this.setState({
      postUrl: null,
      urlPreview: null
    });
  }

  componentWillUnmount() {
    this.updateReducer();
  }

  stateFromReducer() {
    let props = this.props.createPost;
    this.setState({
      ...props,
      body: props.postBody || '',
      category: props.postCategory,
      tags: props.allTags,
    });
    this.parseBody(this.state);
  }

  updateReducer() {
    const allTags = this.state.tags ? this.state.tags.concat(this.state.selectedTags) : [];
    const tags = Array.from(new Set(allTags));

    let state = {
      ...this.state,
      postBody: this.state.body,
      postCategory: this.state.category,
      allTags: tags,
      postImage: this.state.urlPreview ? this.state.urlPreview.image : null,
    };
    this.props.actions.setCreaPostState(state);
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
    let { auth, close, actions, router, location, createPost } = this.props;
    let { tags, body, selectedTags, postUrl, urlPreview, category, mentions, domain } = this.state;
    try {
      let validate = this.validateInput();
      if (validate !== true) {
        throw new Error(validate);
      }
      const allTags = tags.concat(selectedTags);
      tags = Array.from(new Set(allTags));

      body = body.replace(/&nbsp;/gi, '');

      let post = {
        link: postUrl || postUrl,
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
        post = { ...createPost.editPost, ...post };
        let success = await actions.editPost(post);
        if (success) {
          this.clearPost();
          router.push(location.pathname);
          if (close) close();
        }
        return;
      }

      let newPost = await actions.submitPost(post);

      if (close) close();
      if (newPost) {
        this.clearPost();
      }

      // this.props.actions.replace(this.props.location.pathname);
      router.push(`/${auth.community}/new/`);
      actions.refreshTab('discover');

      // Analytics.logEvent('newPost', {
      //   viaShare: this.props.share
      // });
    } catch (err) {
      console.log(err);
      alert(err.message);
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


  parseBody(newState) {
    let postBody = newState.body;
    if (postBody === '') return;
    let lines = postBody.replace(/&nbsp;/g, ' ').split('\n');
    let words = [];
    lines.forEach(line => words = words.concat(line.split(' ')));

    let shouldParseUrl = false;
    let prevLength = this.state.body.length || 0;

    if (postBody.length - prevLength > 1) shouldParseUrl = true;
    if (words[words.length - 1] == '') shouldParseUrl = true;
    if (postBody[postBody.length - 1] == '\n') shouldParseUrl = true;

    if (this.state.url &&
      !this.state.postUrl &&
      shouldParseUrl &&
      this.state.postUrl !== this.state.url) {
      this.createPreview();
    }
  }

  addTextFromLink() {
    const description = '"' + utils.text.stripHTML(this.state.urlPreview.description) + '"';
    this.setState({
      body: description,
    });
  }

  setCategory(category) {
    this.setState({ category });
    this.props.actions.setPostCategory(category);
  }

  createPreview() {
    let { url, failedUrl } = this.state;
    // better logic?
    if (url === failedUrl) return;
    let postUrl = url;
    utils.post.generatePreviewServer(postUrl)
    .then((results) => {
      if (results && results.url) {
        // console.log('set preview', postUrl);
        let imageURL = results.image;
        if (imageURL && imageURL.indexOf(', ')) {
          imageURL = imageURL.split(', ')[0];
        }
        this.setState({
          domain: results.domain,
          postUrl: results.url,
          loadingPreview: false,
          keywords: results.keywords,
          postTags: results.tags,
          urlPreview: {
            image: imageURL,
            title: results.title || 'Untitled',
            description: results.description,
            domain: results.domain,
            loading: false,
          },
        });
      } else {
        this.setState({ failedUrl: this.state.url });
      }
    });
    this.setState({
      body: this.state.body.replace(postUrl, '').trim(),
      loadingPreview: true,
      urlPreview: {
        loading: true,
      }
    });
  }

  renderPreview() {
    if (!this.state.urlPreview) return null;
    return (
      <div style={{ position: 'relative' }}>
        <PostInfo small close={this.clearUrl.bind(this)} post={this.state.urlPreview} />
        <a onClick={this.clearUrl.bind(this)} className='removeUrl'>remove url</a>
      </div>
    );
  }

  render() {
    const placeholder = this.state.urlPreview ? textPlaceholder : urlPlaceholder;
    if (!this.state.active && !this.props.modal) {
      return (
        <CreatePostTeaser
          user={this.props.auth.user}
          onClick={() => this.setState({ active: true })}
        />
      );
    }
    return (
      <div className="createPostContainer">
        <div className="urlPreview">
          {this.renderPreview()}
        </div>
        <AvatarBox user={this.props.auth.user} auth={this.props.auth} />

        <div style={{ position: 'relative' }}>
          <RichText
            className="postInput"
            body={this.state.body}
            placeholder={placeholder}
            onChange={this.handleBodyChange}
            onBlur={e => {
              if (!this.state.body.length && !this.state.postUrl) {
                this.setState({ active: false });
              }
            }}
          />
          <div className='addFromLink'>
            {this.state.urlPreview &&
              this.state.body === '' &&
              this.state.urlPreview.description &&
              <button onClick={this.addTextFromLink} className="addTextFromLink">
                Paste article description
              </button>
            }
          </div>
        </div>

        <div className="createOptions">
          <TagInput
            selectedTags={this.state.selectedTags}
            selectTag={this.selectTags}
            deselectTag={tag => {
              let selectedTags = this.state.selectedTags;
              selectedTags = selectedTags.filter(t => t !== tag);
              this.setState({ selectedTags });
            }}
            placeholderText={!this.state.selectedTags ? 'Please add at least one tag' : ''}
          />

          <row>
            <button
              className="basicButton"
              onClick={this.clearPost}
            >
              Clear
            </button>

            <button
              className="shadowButton"
              onClick={() => this.createPost()}
              disabled={!this.state.selectedTags.length || (!this.state.body.length && !this.state.postUrl)}
            >
              {this.props.createPost.edit ? 'Update Post' : 'Create Post'}
            </button>
          </row>

          <SelectTags
            className="shadowButton"
            text={'Suggested article tags'}
            tags={this.state.keywords}
            selectedTags={this.state.selectedTags}
            selectTag={this.selectTags}
            deselectTag={tag => {
              let selectedTags = this.state.selectedTags;
              selectedTags = selectedTags.filter(t => t !== tag);
              this.setState({ selectedTags });
            }}
          />
          <SelectTags
            className="shadowButton"
            text={'Suggested community tags'}
            tags={this.props.tags.parentTags.map(t => t._id)}
            selectedTags={this.state.selectedTags}
            selectTag={this.selectTags}
            deselectTag={(tag) => {
              let selectedTags = this.state.selectedTags;
              selectedTags = selectedTags.filter(t => t !== tag);
              this.setState({ selectedTags });
            }}
          />
        </div>
      </div>
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
        ...tagActions,
      },
      dispatch
    ),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreatePostContainer));
