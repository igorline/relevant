import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ContentEditable from '../common/contentEditable.component';
import * as userActions from '../../../actions/user.actions';
import * as postActions from '../../../actions/createPost.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as utils from '../../../utils';

import AvatarBox from '../common/avatarbox.component';
import PostInfo from '../post/postinfo.component';
import UserSearch from './userSearch.component';

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./createPost.css');
}

// eslint-disable-next-line no-useless-escape, max-len
const URL_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,16}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

// const urlPlaceholder = 'What\'s relevant?  Add a link to post commentary';
// const textPlaceholder = 'Enter your commentary';

class CreatePostContainer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBodyChange = this.handleBodyChange.bind(this);
    this.parseBody = this.parseBody.bind(this);
    this.createPreview = this.createPreview.bind(this);
    this.handleSetMention = this.handleSetMention.bind(this);
    this.addTextFromLink = this.addTextFromLink.bind(this);
    this.renderCategories = this.renderCategories.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.createPost = this.createPost.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.state = {
      body: '',
      category: '',
      domain: null,
      urlPreview: null,
      addedTextFromLink: false,
      loadingPreview: false,
      userSearchIndex: -1,
    };
    this.body = '';
    this.tags = null;
    this.url = null;
    this.mention = null;
    this.urlPreview = null;
    this.input = null;
    this.categories = null;
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
    // console.log('tags', newProps, newState, !!newProps.tags)
    if (newProps.tags &&
        newProps.tags.parentTags !== this.props.tags.parentTags &&
        this.categories === null) {
      this.renderCategories(newProps.tags.parentTags);
      // this.setState({ category: JSON.parse(newProps.tags.parentTags[0].target.value) });
    }
    if (newState.urlPreview !== this.state.urlPreview) {
      this.renderPreview(newState);
    }
  }

  componentDidUpdate() {
    this.lengthDelta = 0;
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
    this.setState({ body });
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

    let postUrl = words.find(word => URL_REGEX.test(word.toLowerCase()));

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

  addTextFromLink() {
    const description = '"' + utils.text.stripHTML(this.state.urlPreview.description) + '"';
    this.setState({
      body: description,
      addedTextFromLink: true,
    });
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
      loadingPreview: true,
      urlPreview: {
        loading: true,
      }
    });
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
    this.categories = (
      <select
        onChange={(val) => {
          this.setState({ category: JSON.parse(val.target.value) });
        }}
      >
        {inner}
      </select>
    );
  }

  renderPreview(newState) {
    this.urlPreview = (
      <PostInfo post={newState.urlPreview} />
    );
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
          body={this.state.body}
          onChange={this.handleBodyChange}
          onKeyDown={this.handleKeyDown}
          lengthDelta={this.lengthDelta}
        />
        <div className="createOptions">
          <UserSearch
            users={this.props.userSearch}
            onChange={this.handleSetMention}
            userSearchIndex={this.state.userSearchIndex}
          />
          <div>
            {this.state.urlPreview && !this.state.addedTextFromLink &&
              <button onClick={this.addTextFromLink} className="addTextFromLink">
                Add text from link
              </button>
            }
          </div>
          <div>
            {this.categories}
            <button
              onClick={() => this.createPost()}
              disabled={!this.state.category}
            >
              Create Post
            </button>
          </div>
        </div>
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
    userSearch: state.user.search,
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
