import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import ULink from 'modules/navigation/ULink.component';
import {
  View,
  Image,
  BodyText,
  Title,
  CTALink,
  LinkFont,
  Header,
  Divider
} from 'modules/styled/uni';
import { colors } from 'app/styles';

class CommunityAdminList extends Component {
  static propTypes = {
    community: PropTypes.object
  };

  handleJoinCommunity = e => {
    e.preventDefault();
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
            <ULink key={c.slug} to={communityURl} mt={4}>
              <View fdirection="row" align="flex-start">
                <Image source={c.image} h={8} w={8} mr={1} bg={colors.secondaryBG} />
                <View fdirection="column" h={8} justify="space-between" shrink={1}>
                  <Title inline={1}>
                    {c.name}
                    <CTALink inline={1} ml={0.5} onClick={this.handleJoinCommunity}>
                      Join Community
                    </CTALink>
                  </Title>
                  <BodyText inline={1} c={colors.black} numberOfLines={1}>
                    {c.description}
                  </BodyText>
                  <LinkFont inline={1} c={colors.black}>
                    {c.memberCount} member{c.memberCount > 1 ? 's' : ''}
                  </LinkFont>
                </View>
              </View>
            </ULink>
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

const mapDispatchToProps = () => ({});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CommunityAdminList)
);
