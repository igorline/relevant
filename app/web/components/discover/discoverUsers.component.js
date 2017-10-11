import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';

import AvatarBox from '../common/avatarbox.component';

class DiscoverUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const users = this.props.user.list[this.props.tag || 'all'] || [];
    const userRows = users.map( (user, i) => {
      return (<DiscoverUser
        key={i}
        relevance={this.props.tag || false}
        tag={this.props.tag}
        user={user}
      />);
    })
    return (
      <div className='discoverUsers'>
        {userRows}
      </div>
    );
  }
}

class DiscoverUser extends Component {
  render() {
    let user = this.props.user;
    let relevance = this.props.tag ? user[this.props.tag + '_relevance'] : user.relevance;
    let bio = user.bio;

    return (
      <div className='discoverUserContainer'>
        <div className='discoverUser'>
          <div className='left'>
            <AvatarBox
              dontShowRelevance
              user={user}
            />
          </div>
          <div className='right'>
            <img src='/img/r-emoji.png' className='r' />
            {Math.round(relevance)}
          </div>
        </div>
        {bio &&
          <div className='bio'>
            {bio}
          </div>
        }
      </div>
    );
  }
}

export default DiscoverUsers;
