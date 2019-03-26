import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { joinCommunity } from 'community/community.actions';

import ULink from 'modules/navigation/ULink.component';
import {
  View,
  Image,
  BodyText,
  Title,
  LinkFont,
  Header,
  Divider
} from 'modules/styled/uni';
import { colors } from 'app/styles';

class CommunityAdminList extends Component {
  static propTypes = {
    community: PropTypes.object,
    actions: PropTypes.object
  };

  handleJoinCommunity = (e, community) => {
    e.preventDefault();
    this.props.actions.joinCommunity(community);
  };

  render() {
    const {
      community: { communities }
    } = this.props;
    return (
      <View m={'0 4'} fdirection="column">
        <Header>Communities on Relevant</Header>
        {Object.values(communities).map(c => {
          const communityURl = `/${c.slug}/new`;
          return (
            <View fdirection="row" align="flex-start" mt={4} key={c._id}>
              <ULink key={c.slug} to={communityURl}>
                <Image source={c.image} h={8} w={8} mr={1} bg={colors.secondaryBG} />
              </ULink>
              <View fdirection="column" h={8} justify="space-between" shrink={1}>
                <View fdirection="row">
                  <BodyText inline={1}>
                    <ULink key={c.slug} to={communityURl} inline={1}>
                      <Title inline={1}>{c.name}</Title>
                    </ULink>
                    <ULink
                      to="#"
                      inline={1}
                      ml={0.5}
                      onPress={e => this.handleJoinCommunity(e, c)}
                      onClick={e => this.handleJoinCommunity(e, c)}
                      authrequired={true}
                      c={colors.blue}
                      hc={colors.black}
                    >
                      <LinkFont inline={1} c={colors.blue}>
                        Join Community
                      </LinkFont>
                    </ULink>
                  </BodyText>
                </View>
                <BodyText inline={1} c={colors.black} numberOfLines={1}>
                  {c.description}
                </BodyText>
                <LinkFont inline={1} c={colors.black}>
                  {c.memberCount} member{c.memberCount > 1 ? 's' : ''}
                </LinkFont>
              </View>
            </View>
          );
        })}
        <Divider m={'4 0'} />
        <Header>Start a Community on Relevant</Header>
        <BodyText m={'4 0 12 0'}>
          <ULink external to="mailto:info@relevant.community">
            Get in touch
          </ULink>{' '}
          if you'd like to start a community
        </BodyText>
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
      joinCommunity
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CommunityAdminList)
);
