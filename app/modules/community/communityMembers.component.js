import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { joinCommunity, searchMembers } from 'community/community.actions';
import AvatarBox from 'modules/user/avatarbox.component';
import { connect } from 'react-redux';
import { Input } from 'modules/styled/web';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import { View, BodyText, SecondaryText } from 'modules/styled/uni';

const CommunityMember = ({ user }) => (
  <View fdirection="row" m={['1 0']}>
    <AvatarBox user={user} showRelevance condensedView={false} />
  </View>
);

CommunityMember.propTypes = {
  user: PropTypes.object
};

class CommunityMembers extends Component {
  static propTypes = {
    community: PropTypes.object,
    actions: PropTypes.object
  };

  state = {
    searchResults: [],
    searchValue: ''
  };

  searchMembers = async val => {
    const { community } = this.props;
    return this.props.actions.searchMembers(val, community.active);
  };

  debouncedSearchMembers = AwesomeDebouncePromise(this.searchMembers, 100);

  handleChange = async e => {
    this.setState({
      searchValue: e.target.value
    });
    const results = await this.debouncedSearchMembers(e.target.value);
    this.setState({
      searchResults: results
    });
  };

  getTitle(role) {
    const TITLES = {
      admin: 'Adminstrators',
      user: 'Trusted Users'
    };
    return TITLES[role];
  }

  render() {
    const { community } = this.props;
    const { searchResults, searchValue } = this.state;
    const { active, members, communityMembers } = community;
    const activeCommunityMembers = communityMembers[active];
    // const admins = activeCommunityMembers.filter(member => members[member].role === 'admin');
    // const others = activeCommunityMembers.filter(member => admins.indexOf(member) === -1);
    let role;
    return (
      <View fdirection="column">
        <BodyText>Search bar</BodyText>
        <Input
          placeholder="Search"
          onChange={this.handleChange}
          value={searchValue}
          type="search"
        />
        <View mt={2}>
          {!searchValue &&
            activeCommunityMembers.map(memberId => {
              const user = members[memberId];
              const title = role === user.role ? null : this.getTitle(user.role);
              role = user.role;
              return (
                <React.Fragment key={user._id}>
                  {title ? <SecondaryText m={'2 0'}>{title}</SecondaryText> : null}
                  <CommunityMember
                    user={{ ...user.embeddedUser, relevance: user.reputation + 0.1 }}
                    key={user._id}
                  />
                </React.Fragment>
              );
            })}
          {!!searchValue && searchResults.length
            ? searchResults.map(user => {
              const title = role === user.role ? null : this.getTitle(user.role);
              role = user.role;
              return (
                <React.Fragment key={user._id}>
                  {title ? <SecondaryText m={'2 0'}>{title}</SecondaryText> : null}
                  <CommunityMember
                    user={{ ...user.embeddedUser, relevance: user.reputation + 0.1 }}
                    key={user._id}
                  />
                </React.Fragment>
              );
            })
            : null}
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community
  // auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      joinCommunity,
      searchMembers
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CommunityMembers)
);
