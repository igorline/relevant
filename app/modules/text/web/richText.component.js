import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { text as textUtils, post } from 'app/utils';
import UserSearch from 'modules/createPost/web/userSearch.component';
import * as userActions from 'modules/user/user.actions';
import ContentEditable from './contentEditable.component';

if (process.env.BROWSER === true) {
  require('./richText.css');
}

class RichText extends Component {
  static propTypes = {
    actions: PropTypes.object,
    onChange: PropTypes.func,
    userSearch: PropTypes.array,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    body: PropTypes.string
  };

  state = {
    body: '',
    userSearchIndex: -1,
    text: ''
  };

  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetMention = this.handleSetMention.bind(this);
    this.parseBody = this.parseBody.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.body === state.body) return null;
    return {
      body: props.body,
      text: props.body
    };
  }

  componentDidUpdate(prevProps, prevState) {
    this.lengthDelta = 0;
    if (prevState.text === this.state.text) return null;
    const { text } = this.state;
    const data = this.parseBody(text, prevState);
    return this.props.onChange(text, data);
  }

  parseBody(text = '', prevState) {
    const { userSearch } = this.props;
    text = text.replace(/&nbsp;/gi, ' ');
    const words = textUtils.getWords(text);

    let shouldParseUrl = false;

    if (prevState) {
      const prevLength = prevState.text.length || 0;
      if (text.length - prevLength > 1) shouldParseUrl = true;
      if (words[words.length - 1] == '') shouldParseUrl = true; // eslint-disable-line
      if (text[text.length - 1] == '\n') shouldParseUrl = true; // eslint-disable-line
    }

    const url = shouldParseUrl
      ? words.find(word => post.URL_REGEX.test(word.toLowerCase()))
      : null;

    const lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else if (userSearch.length) {
      this.props.actions.setUserSearch([]);
    }

    const tags = textUtils.getTags(words);
    const mentions = textUtils.getMentions(words);

    return {
      url,
      tags,
      mentions,
      shouldParseUrl
    };
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }

  handleSetMention(user) {
    if (!user) return;

    // replace the partial @username with @username plus a nbsp
    this.lengthDelta = user.handle.length - this.mention.length + 2;
    const body =
      this.state.text.slice(0, -this.mention.length) + '@' + user.handle + '\u00A0';

    this.setState({ text: body, userSearchIndex: -1 });
    const data = this.parseBody(body);
    this.props.onChange(body, data);
    this.props.actions.setUserSearch([]);
  }

  handleKeyDown(e) {
    const userCount = this.props.userSearch.length;
    switch (e.keyCode) {
      case 37: // left
      case 38: // up
        if (this.props.userSearch.length) {
          e.preventDefault();
          this.setState({
            userSearchIndex: (this.state.userSearchIndex - 1 + userCount) % userCount
          });
        }
        break;
      case 39: // right
      case 40: // down
        if (this.props.userSearch.length) {
          e.preventDefault();
          this.setState({
            userSearchIndex: (this.state.userSearchIndex + 1) % userCount
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

  render() {
    return (
      <div>
        <ContentEditable
          className={'editor ' + this.props.className}
          body={this.state.body}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          lengthDelta={this.lengthDelta}
          onBlur={this.props.onBlur}
          onFocus={this.props.onFocus}
        />
        <UserSearch
          users={this.props.userSearch}
          onChange={this.handleSetMention}
          userSearchIndex={this.state.userSearchIndex}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userSearch: state.user.search
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...userActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RichText);
