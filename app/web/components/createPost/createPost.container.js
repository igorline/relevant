import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as navigationActions from '../../../actions/navigation.actions';
import ContentEditable from '../common/contentEditable.component';
import * as userActions from '../../../actions/user.actions';
import * as createPostActions from '../../../actions/createPost.actions';
import * as postActions from '../../../actions/post.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as utils from '../../../utils';

import CreatePostTeaser from './createPostTeaser.component';
import AvatarBox from '../common/avatarbox.component';
import PostInfo from '../post/postinfo.component';
import UserSearch from './userSearch.component';
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
    this.handleSetMention = this.handleSetMention.bind(this);
    this.addTextFromLink = this.addTextFromLink.bind(this);
    this.setCategory = this.setCategory.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.createPost = this.createPost.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.clearPost = this.clearPost.bind(this);
    this.selectTags = this.selectTags.bind(this);
    this.state = {
      body: '',
      category: '',
      domain: null,
      urlPreview: null,
      loadingPreview: false,
      userSearchIndex: -1,
      selectedTags: []
      // active: true
    };
    this.body = '';
    this.tags = null;
    this.url = null;
    this.mention = null;
    this.urlPreview = null;
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
    }
  }

  selectTags(tag) {
    if (!tag || !tag.length) return;
    if (typeof tag === 'string') tag = [tag];
    let selectedTags = this.state.selectedTags;
    selectedTags = [...new Set([...selectedTags, ...tag])];
    console.log(selectedTags);
    this.setState({ selectedTags });
  }

  clearPost() {
    this.url = null;
    this.urlPreview = null;
    this.props.actions.clearCreatePost();
    this.stateFromReducer();
  }

  componentDidUpdate() {
    this.lengthDelta = 0;
  }

  componentWillUnmount() {
    this.updateReducer();
  }

  stateFromReducer() {
    let props = this.props.createPost;
    this.setState({
      ...props,
      body: props.postBody,
      category: props.postCategory,
      tags: props.allTags,
    });
    this.parseBody(this.state);
  }

  updateReducer() {
    const allTags = this.tags ? this.tags.concat(this.state.selectedTags) : [];
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
      return this.setSate({ validate: 'Please select at least one topic' });
    }
    if (!this.props.body && !this.state.postUrl) {
      return this.setSate({ validate: 'Please paste article link' });
    }
  }

  async createPost() {
    try {
      const allTags = this.tags.concat(this.state.selectedTags);
      const tags = Array.from(new Set(allTags));

      let body = this.state.body.replace(/&nbsp;/gi, '');

      let post = {
        link: this.state.postUrl || this.props.postUrl,
        tags,
        body,
        title: this.state.urlPreview ? this.state.urlPreview.title : null,
        description: this.state.urlPreview ? this.state.urlPreview.description : null,
        category: this.state.category,
        image: this.state.urlPreview ? this.state.urlPreview.image : null,
        mentions: this.mentions,
        domain: this.state.domain
      };

      if (this.props.createPost.edit) {
        post = { ...this.props.createPost.editPost, ...post };
        let success = await this.props.actions.editPost(post);
        if (success) {
          this.clearPost();
          this.props.router.push(this.props.location.pathname);
          if (this.props.close) this.props.close();
        }
        return;
      }

      let newPost = await this.props.actions.submitPost(post);

      if (this.props.close) this.props.close();
      if (newPost) {
        this.clearPost();
      }

      // this.props.actions.replace(this.props.location.pathname);
      this.props.router.push('/discover/new/');
      this.props.actions.refreshTab('discover');

      // Analytics.logEvent('newPost', {
      //   viaShare: this.props.share
      // });
    } catch (err) {
      alert(err.message);
    }
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  handleKeyDown(e) {
    // console.log(e.keyCode);
    const userCount = this.props.userSearch.length;
    switch (e.keyCode) {
      case 37: // left
      case 38: // up
        if (this.props.userSearch.length) {
          e.preventDefault();
          this.setState({
            userSearchIndex: (this.state.userSearchIndex - 1 + userCount) % userCount,
          });
        }
        break;
      case 39: // right
      case 40: // down
        if (this.props.userSearch.length) {
          e.preventDefault();
          this.setState({
            userSearchIndex: (this.state.userSearchIndex + 1) % userCount,
          });
        }
        break;
      case 13: // enter
        if (this.props.userSearch.length) {
          e.preventDefault();
          const userIndex = Math.max(this.state.userSearchIndex, 0);
          const user = this.props.userSearch[userIndex];
          this.handleSetMention(user);
        }
        break;
      default:
        break;
    }
    return true;
  }

  handleBodyChange(e) {
    const body = e.target.value;
    if (body !== this.state.body) {
      this.setState({ body });
    }
  }

  handleSetMention(user) {
    if (!user) return;
    // replace the partial @username with @username plus a nbsp
    this.lengthDelta = user._id.length - this.mention.length + 2;
    const body = this.state.body.replace(this.mention, '@' + user._id + '\u00A0'); // nbsp
    this.setState({ body, userSearchIndex: -1 });
    this.props.actions.setUserSearch([]);
  }

  parseBody(newState) {
    let postBody = '';
    if (newState) postBody = newState.body;
    let lines = postBody.replace(/&nbsp;/g, ' ').split('\n');
    let words = [];
    lines.forEach(line => words = words.concat(line.split(' ')));

    let shouldParseUrl = false;
    let prevLength = this.body.length || 0;

    if (postBody.length - prevLength > 1) shouldParseUrl = true;
    if (words[words.length - 1] == '') shouldParseUrl = true;
    if (postBody[postBody.length - 1] == '\n') shouldParseUrl = true;

    let postUrl = words.find(word => URL_REGEX.test(word.toLowerCase()));

    if (shouldParseUrl && postUrl && postUrl !== this.url) {
      this.url = postUrl;
      this.createPreview();
    }

    let lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else {
      this.props.actions.setUserSearch([]);
    }

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

    this.body = postBody;
    this.tags = bodyTags;
    this.mentions = bodyMentions;
    // console.log(this.body, this.tags, this.mentions)
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
    let postUrl = this.url;
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
        this.url = null;
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
      <PostInfo small post={this.state.urlPreview} />
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
          <ContentEditable
            className="editor"
            body={this.state.body}
            placeholder={placeholder}
            onChange={this.handleBodyChange}
            onKeyDown={this.handleKeyDown}
            lengthDelta={this.lengthDelta}
            onBlur={e => {
              if (!this.state.body.length && !this.state.postUrl) {
                this.setState({ active: false });
              }
              // e.preventDefault();
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
          <UserSearch
            users={this.props.userSearch}
            onChange={this.handleSetMention}
            userSearchIndex={this.state.userSearchIndex}
          />
          <TagInput
            selectedTags={this.state.selectedTags}
            selectTag={this.selectTags}
            deselectTag={tag => {
              let selectedTags = this.state.selectedTags;
              selectedTags = selectedTags.filter(t => t !== tag);
              this.setState({ selectedTags });
            }}
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
              disabled={!this.state.selectedTags.length || (!this.body.length && !this.state.postUrl)}
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
