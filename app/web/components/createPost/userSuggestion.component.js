import React, { Component } from 'react';
import Avatar from '../common/avatar.component';

if (process.env.BROWSER === true) {
  // require('./divider.css');
}

const USER_ELEMENT_HEIGHT = 30;

export default class UserSuggestion extends Component {
  componentDidMount() {
    this.updateScrollPosition();
  }
  componentDidUpdate() {
    this.updateScrollPosition();
  }
  updateScrollPosition() {
    // const len = this.props.users.length;
    // this.scrollIndex = (this.scrollIndex - 1 + len) % len;
    // this.scrollIndex = (this.scrollIndex + 1) % this.props.users.length;
    const offset = Math.max(this.props.selectedIndex - 1, 0) * USER_ELEMENT_HEIGHT;
    this.el.scrollTop = offset;
  }
  render() {
    // this.suggestedUsers = users;
    const selectedIndex = this.props.selectedIndex;
    let inner = this.props.users.map((user, i) => (
      <button
        key={i}
        className={selectedIndex === i ? 'selected' : ''}
        onClick={() => this.setMention(user)}
      >
        <Avatar user={user} nolink />
        <span className="username">{user._id}</span>
      </button>
    ));
    return (
      <div
        ref={(el) => { this.el = el; }}
        className="userSuggestion"
      >
        {inner}
      </div>
    );
  }
}
