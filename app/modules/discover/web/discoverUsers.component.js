import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/web/avatarbox.component';

class DiscoverUsers extends Component {
  static propTypes = {
    user: PropTypes.object,
    tag: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const users = this.props.user.list[this.props.tag || 'all'] || [];
    const userRows = users.map((user, i) => (
      <DiscoverUser
        key={i}
        relevance={this.props.tag || false}
        tag={this.props.tag}
        user={user}
      />
    ));
    return <div className="discoverUsers">{userRows}</div>;
  }
}

class DiscoverUser extends Component {
  static propTypes = {
    user: PropTypes.object,
    tag: PropTypes.object
  };

  render() {
    const { user } = this.props;
    const relevance = this.props.tag
      ? user[this.props.tag + '_relevance']
      : user.relevance;
    const { bio } = user;

    return (
      <div className="discoverUserContainer">
        <div className="discoverUser">
          <div className="left">
            <AvatarBox user={user} />
          </div>
          <div className="right">
            <img src="/img/r-emoji.png" className="r" />
            {Math.round(relevance)}
          </div>
        </div>
        {bio && <div className="bio">{bio}</div>}
      </div>
    );
  }
}

export default DiscoverUsers;
