import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { joinCommunity } from 'community/community.actions';
import { css } from 'styled-components';

import ULink from 'modules/navigation/ULink.component';
import { View, Image, BodyText, Title, LinkFont } from 'modules/styled/uni';

import { colors } from 'app/styles';

const linkStyles = css`
  :hover {
    background: ${colors.secondaryBG};
  }
`;

class CommunityAdminList extends Component {
  static propTypes = {
    community: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object,
    hashtags: PropTypes.bool,
    p: PropTypes.number
  };

  handleJoinCommunity = (e, community) => {
    const { auth } = this.props;
    if (auth.isAuthenticated) {
      this.props.actions.joinCommunity(community);
    }
  };

  renderJoinLink = c => (
    <LinkFont
      inline={1}
      c={colors.blue}
      onPress={e => this.handleJoinCommunity(e, c)}
      onClick={e => this.handleJoinCommunity(e, c)}
    >
      Join Community
    </LinkFont>
  );

  renderInnerText = c => {
    const { hashtags } = this.props;
    return hashtags ? (
      <BodyText c={colors.black} mt={0.5}>
        {c.topics.map(t => '#' + t).join(', ')}
      </BodyText>
    ) : (
      <React.Fragment>
        <BodyText inline={1} c={colors.black} mt={0.5}>
          {c.description}
        </BodyText>
        <LinkFont inline={1} c={colors.black} mt={0.5}>
          {c.memberCount} member{c.memberCount > 1 ? 's' : ''}
        </LinkFont>
      </React.Fragment>
    );
  };

  render() {
    const {
      community: { communities },
      p
    } = this.props;
    const hP = p || 4;
    return (
      <View fdirection="column">
        {Object.values(communities).map(c => {
          const communityURl = `/${c.slug}/new`;
          return (
            <ULink to={communityURl} key={c._id} styles={linkStyles}>
              <View fdirection="row" align="flex-start" p={`2 ${hP}`}>
                <Image source={c.image} h={8} w={8} mr={2} bg={colors.secondaryBG} />
                <View fdirection="column" justify="space-between" shrink={1}>
                  <BodyText inline={1}>
                    <Title inline={1}>{c.name} </Title>
                  </BodyText>
                  {this.renderInnerText(c)}
                </View>
              </View>
            </ULink>
          );
        })}
      </View>
    );
  }
}
const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community,
  auth: state.auth
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
