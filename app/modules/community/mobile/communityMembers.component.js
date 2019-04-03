import React, { Component } from 'react';
import { View, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { searchMembers, getCommunityMembers } from 'community/community.actions';

import * as navigationActions from 'modules/navigation/navigation.actions';

import DiscoverUser from 'modules/discover/mobile/discoverUser.component';
import CustomListView from 'modules/listview/mobile/customList.component';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';

class CommunityMembers extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    invest: PropTypes.object,
    actions: PropTypes.object,
    users: PropTypes.object,
    community: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.state = {
      loaded: false
    };
    this.pageSize = 20;
  }

  componentWillMount() {
    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.load(0, this.pageSize);
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  load = (page, length) => {
    this.setState({ loaded: false });
    const { community } = this.props;
    this.props.actions
    .getCommunityMembers({
      slug: community.active,
      skip: length,
      limit: this.pageSize
    })
    .then(() => {
      this.setState({ loaded: true });
    });
  };

  renderRow(memberId) {
    const { members } = this.props.community;
    const user = members[memberId];
    if (!user || !memberId) return null;
    return (
      <DiscoverUser
        relevance
        user={{
          ...user.embeddedUser,
          relevance: {
            pagerank: user.reputation
          }
        }}
        relevance={user.reputation}
        renderRight={() => null}
        showRelevance
        {...this.props}
      />
    );
  }

  render() {
    const { community } = this.props;
    const { loaded } = this.state;
    const { active, communityMembers } = community;
    const activeCommunityMembers = communityMembers[active] || [];
    let listEl = <CustomSpinner />;

    if (!this.loading) {
      listEl = (
        <CustomListView
          data={activeCommunityMembers}
          loaded={!!activeCommunityMembers.length || loaded}
          renderRow={this.renderRow}
          load={this.load}
          type={'community members'}
          parent={'members'}
          active
          view={0}
          scrollableTab
        />
      );
    }

    return <View style={{ flex: 1 }}>{listEl}</View>;
  }
}

function mapStateToProps(state) {
  return {
    community: state.community,
    invest: state.investments,
    users: state.user.users,
    error: state.error.discover,
    tabs: state.navigation.tabs
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions,
        searchMembers,
        getCommunityMembers
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunityMembers);
