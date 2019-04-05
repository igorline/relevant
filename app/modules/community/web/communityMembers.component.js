import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  joinCommunity,
  searchMembers,
  getCommunityMembers
} from 'community/community.actions';
import AvatarBox from 'modules/user/avatarbox.component';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import InfScroll from 'modules/listview/web/infScroll.component';
import { Input } from 'modules/styled/web';
import { View, SecondaryText } from 'modules/styled/uni';
import styled from 'styled-components/primitives';

const ScrollContainer = styled(View)`
  overflow: auto;
`;

class CommunityMembers extends Component {
  static propTypes = {
    community: PropTypes.object,
    actions: PropTypes.object,
    close: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.pageSize = 20;
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

  renderRow = user => {
    const title = this.role === user.role ? null : this.getTitle(user.role);
    this.role = user.role;
    const { close } = this.props;
    return (
      <React.Fragment key={user._id}>
        {title ? <SecondaryText m={'2 0'}>{title}</SecondaryText> : null}
        <View fdirection="row" m={['2 0']}>
          <AvatarBox
            user={{
              ...user.embeddedUser,
              relevance: {
                pagerank: user.reputation
              }
            }}
            navigationCallback={close}
            showRelevance
            condensedView={false}
          />
        </View>
      </React.Fragment>
    );
  };

  render() {
    const { community } = this.props;
    const { searchResults, searchValue } = this.state;
    const { active, members, communityMembers } = community;
    const activeCommunityMembers = communityMembers[active] || [];
    return (
      <View fdirection="column">
        <Input
          placeholder="Search"
          onChange={this.handleChange}
          value={searchValue}
          type="search"
        />

        <ScrollContainer h={40} mt={2}>
          {!searchValue ? (
            <InfScroll
              className={'communityMembers'}
              data={activeCommunityMembers}
              loadMore={p => this.load(p, activeCommunityMembers.length)}
              hasMore={this.hasMore}
              useWindow={false}
            >
              {activeCommunityMembers.map(memberId => {
                const user = members[memberId];
                return this.renderRow(user);
              })}
            </InfScroll>
          ) : (
            searchResults.map(user => this.renderRow(user))
          )}
        </ScrollContainer>
      </View>
    );
  }
}
const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community
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
