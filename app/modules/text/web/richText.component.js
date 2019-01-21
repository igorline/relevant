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
    body: PropTypes.string,
  };

  state = {
    body: '',
    userSearchIndex: -1
  };

  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetMention = this.handleSetMention.bind(this);
    this.parseBody = this.parseBody.bind(this);
  }

  componentDidUpdate() {
    this.lengthDelta = 0;
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      body: nextProps.body
    };
  }

  parseBody(text = '') {
    text = text.replace(/&nbsp;/gi, ' ');
    const words = textUtils.getWords(text);

    const url = words.find(word => post.URL_REGEX.test(word.toLowerCase()));

    const lastWord = words[words.length - 1];
    if (lastWord.match(/^@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } else {
      this.props.actions.setUserSearch([]);
    }

    const tags = textUtils.getTags(words);
    const mentions = textUtils.getMentions(words);

    return {
      url,
      tags,
      mentions
    };
  }

  handleChange(e) {
    const data = this.parseBody(e.target.value);
    this.props.onChange(e.target.value, data);
  }

  handleSetMention(user) {
    if (!user) return;

    // replace the partial @username with @username plus a nbsp
    this.lengthDelta = user._id.length - this.mention.length + 2;
    const body = this.state.body.slice(0, -this.mention.length) + '@' + user.handle + '\u00A0';

    this.setState({ body, userSearchIndex: -1 });
    const data = this.parseBody(body);
    this.props.onChange(body, data);
    this.props.actions.setUserSearch([]);
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
