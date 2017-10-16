import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ContentEditable from '../common/contenteditable.component';
import * as userActions from '../../../actions/user.actions';
import * as postActions from '../../../actions/createPost.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as utils from '../../../utils';

import AvatarBox from '../common/avatarbox.component';
import PostInfo from '../post/postinfo.component';

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./createPost.css');
}

// eslint-disable-next-line no-useless-escape, max-len
const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,16}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
const HTML_REGEX = new RegExp(/<[^>]*>/, 'gm');

function stripContentEditableHTML(text) {
  return (text || '')
    .replace(/<div><br>/g, '\n')
    .replace(/<div>/g, '\n')
    .replace(/<br>\u200B/g, '\n')
    .replace(HTML_REGEX, '');
}

const urlPlaceholder = 'What\'s relevant?  Add a link to post commentary';
const textPlaceholder = 'Enter your commentary';

function renderBody(lines) {
  return lines.split('\n')
    .map((line) =>
      line.split(' ')
        .map((word) => {
          if (word[0] === '#' || word[0] === '@') {
            return '<b>' + word + '</b>';
          }
          return word;
        })
        .join(' ')
    )
    .join('<br>\u200B');
}

class CreatePostContainer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBodyChange = this.handleBodyChange.bind(this);
    this.parseBody = this.parseBody.bind(this);
    this.createPreview = this.createPreview.bind(this);
    this.setMention = this.setMention.bind(this);
    this.addTextFromLink = this.addTextFromLink.bind(this);
    this.renderUserSuggestion = this.renderUserSuggestion.bind(this);
    this.renderCategories = this.renderCategories.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.createPost = this.createPost.bind(this);
    this.state = {
      body: '',
      html: '',
      category: '',
      domain: null,
      urlPreview: null,
      addedTextFromLink: false,
      loadingPreview: false,
    };
    this.body = '';
    this.tags = null;
    this.url = null;
    this.mention = null;
    this.urlPreview = null;
    this.userSuggestion = null;
    this.input = null;
    this.categories = null;
  }

  componentDidMount() {
    // console.log(this.props)
    if (!this.props.tags || !this.props.tags.parentTags.length) this.props.actions.getParentTags();
  }

  componentWillUpdate(newProps, newState) {
    if (newState.body !== this.state.body) {
      this.parseBody(newState);
    }
    if (newProps.users !== this.props.users) {
      this.renderUserSuggestion(newProps.users.search);
    }
    // console.log('tags', newProps, newState, !!newProps.tags)
    if (newProps.tags &&
        newProps.tags.parentTags !== this.props.tags.parentTags &&
        this.categories === null) {
      this.renderCategories(newProps.tags.parentTags);
    }
    if (newState.urlPreview !== this.state.urlPreview) {
      this.renderPreview(newState);
    }
  }

  renderPreview(newState) {
    this.urlPreview = (
      <PostInfo post={newState.urlPreview} />
    );
  }

  renderCategories(categories) {
    let inner = categories.map((category, i) => (
      <option
        value={JSON.stringify(category)}
        key={i}
      >
        {category.emoji}&nbsp;{category.categoryName}
      </option>
    ));
    this.categories = (<div style={{ margin: '10px 0' }}>
      <h4 style={{ margin: 0 }}>select category</h4>
      <select
        style={{ display: 'block' }}
        onChange={(val) => {
          this.setState({ category: JSON.parse(val.target.value) });
        }}
      >
        {inner}
      </select>
    </div>);
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
      html: this.state.html.replace(postUrl, ''),
      loadingPreview: true,
      urlPreview: {
        loading: true,
      }
    });
  }

  setMention(user) {
    let postBody = this.state.body.replace(this.mention, '@' + user._id);
    this.setState({ body: postBody });
    this.props.actions.setUserSearch([]);
    this.input.focus();
  }

  addTextFromLink() {
    const description = '"' + stripContentEditableHTML(this.state.urlPreview.description) + '"';
    this.setState({
      body: description,
      html: description,
      addedTextFromLink: true,
    });
  }

  parseBody(newState) {
    let postBody = '';
    if (newState) postBody = newState.body;
    let lines = postBody.replace(/&nbsp;/g, ' ').split('\n');
    let words = [];
    lines.forEach(line => words = words.concat(line.split(' ')));

    let postUrl = words.find(word => URL_REGEX.test(word.toLowerCase()));

    // console.log('parseBody', words);
    // console.log('postUrl', postUrl);

    if (postUrl && postUrl !== this.url) {
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

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  renderUserSuggestion(users) {
    let inner = users.map((user, i) => (
      <button
        style={{ display: 'block', cursor: 'pointer' }}
        key={i}
        onClick={() => this.setMention(user)}
      >
        {user._id}
      </button>
    ));

    if (inner.length > 0) {
      this.userSuggestion = (<div>
        <h4 style={{ margin: 0 }}>suggested user{inner.length > 1 ? 's' : ''}</h4>
        {inner}
      </div>);
    } else {
      this.userSuggestion = null;
    }
  }

  async createPost() {
    let post = {
      link: this.state.postUrl || this.props.postUrl,
      tags: this.tags,
      body: this.state.body,
      title: this.state.urlPreview ? this.state.urlPreview.title : null,
      description: this.state.urlPreview ? this.state.urlPreview.description : null,
      category: this.state.category,
      image: this.state.urlPreview ? this.state.urlPreview.image : null,
      mentions: this.mentions,
      investments: [],
      domain: this.state.domain
    };

    this.props.actions.submitPost(post, await utils.token.get())
      .then((res) => {
        if (!res) {
          alert('Post error please try again');
          this.setState({ creatingPost: false });
          return null;
        }
        return res.json();
      }).then((data) => {
        if (!data) return;
        // console.log(data)
        if (this.props.close) this.props.close();
        this.props.router.push('/post/' + data.id);
        // Analytics.logEvent('newPost', {
        //   viaShare: this.props.share
        // });
      });
  }

  handleBodyChange(e) {
    const body = stripContentEditableHTML(e.target.value);
    const html = renderBody(body);
    this.setState({ html, body });
  }

  render() {
    // const placeholderText = this.state.urlPreview ? textPlaceholder : urlPlaceholder;
    return (
      <div className="postContainer createPostContainer">
        <div className="urlPreview">
          {this.urlPreview}
          <AvatarBox user={this.props.auth.user} />
        </div>
        <ContentEditable
          className="editor"
          html={this.state.html}
          body={this.state.body}
          onChange={this.handleBodyChange}
          autoFocus
          ref={(c) => { this.input = c; }}
        />
        {this.state.urlPreview && !this.state.addedTextFromLink &&
          <button onClick={this.addTextFromLink} className="addTextFromLink">
            Add text from link
          </button>
        }
        {this.userSuggestion}
        {this.state.urlPreview &&
          <div>
            {this.categories}
          </div>
        }
        <button
          onClick={() => this.createPost()}
          disabled={!this.state.category}
        >
          Create Post
        </button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  // console.log(state);
  return {
    // isPosting: state.createPost.isPosting,
    // textError: state.createPost.textError,
    // linkError: state.createPost.linkError,
    // imageError: state.createPost.imageError,
    createPost: state.createPost,
    auth: state.auth,
    users: state.user,
    tags: state.tags,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
        ...userActions,
        ...tagActions,
      },
      dispatch),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreatePostContainer));
