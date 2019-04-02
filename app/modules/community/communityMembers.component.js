import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import {
  joinCommunity,
  searchMembers,
  getCommunityMembers
} from 'community/community.actions';
import AvatarBox from 'modules/user/avatarbox.component';
import { connect } from 'react-redux';
import { Input } from 'modules/styled/web';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import InfScroll from 'modules/listview/web/infScroll.component';

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

  constructor(props, context) {
    super(props, context);
    // TODO should set it here and not on server
    this.pageSize = 2;
    this.hasMore = true;
    this.ready = false;
    this.role = null;
  }

  state = {
    searchResults: [],
    searchValue: ''
  };

  componentDidMount() {
    this.load(0, 0);
  }

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

  load = (page, length) => {
    this.hasMore = page * this.pageSize <= length;
    if (this.hasMore) {
      const { community } = this.props;
      this.props.actions.getCommunityMembers({
        slug: community.active,
        skip: length,
        limit: this.pageSize
      });
    }
  };

  getTitle(role) {
    const TITLES = {
      admin: 'Adminstrators',
      user: 'Trusted Users'
    };
    return TITLES[role];
  }

  renderRow = memberId => {
    const { community } = this.props;
    const { members } = community;
    const user = members[memberId];
    const title = this.role === user.role ? null : this.getTitle(user.role);
    this.role = user.role;
    return (
      <React.Fragment key={user._id}>
        {title ? <SecondaryText m={'2 0'}>{title}</SecondaryText> : null}
        <CommunityMember
          user={{ ...user.embeddedUser, relevance: user.reputation + 0.1 }}
          key={user._id}
        />
      </React.Fragment>
    );
  };

  render() {
    const { community } = this.props;
    const { searchResults, searchValue } = this.state;
    const { active, communityMembers } = community;
    const activeCommunityMembers = communityMembers[active] || [];
    const rows = activeCommunityMembers.map(a => this.renderRow(a));
    // const admins = activeCommunityMembers.filter(member => members[member].role === 'admin');
    // const others = activeCommunityMembers.filter(member => admins.indexOf(member) === -1);
    return (
      <View fdirection="column">
        <BodyText>Search bar</BodyText>
        <Input
          placeholder="Search"
          onChange={this.handleChange}
          value={searchValue}
          type="search"
        />
        <InfScroll
          className={'communityMembers'}
          data={activeCommunityMembers}
          loadMore={p => this.load(p, activeCommunityMembers.length)}
          hasMore={this.hasMore}
          useWindow
        >
          {rows}
        </InfScroll>
        <View mt={2}>
          {!!searchValue && searchResults.length
            ? searchResults.map(user => {
              const title = this.role === user.role ? null : this.getTitle(user.role);
              this.role = user.role;
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

// {!searchValue &&
//   activeCommunityMembers.map(memberId => {
//     const user = members[memberId];
//     const title = this.role === user.role ? null : this.getTitle(user.role);
//     this.role = user.role;
//     return (
//       <React.Fragment key={user._id}>
//         {title ? <SecondaryText m={'2 0'}>{title}</SecondaryText> : null}
//         <CommunityMember
//           user={{ ...user.embeddedUser, relevance: user.reputation + 0.1 }}
//           key={user._id}
//         />
//       </React.Fragment>
//     );
//   })}

const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community
  // auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      joinCommunity,
      searchMembers,
      getCommunityMembers
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
