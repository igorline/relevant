import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import ULink from 'modules/navigation/ULink.component';
import { View, Image, BodyText, Title } from 'modules/styled/uni';

class CommunityAdminList extends Component {
  static propTypes = {
    community: PropTypes.object
  };

  render() {
    const {
      community: { communities }
    } = this.props;
    return (
      <View m={4} fdirection="column" wrap>
        {Object.values(communities).map(c => (
          <ULink to={`/admin/community/${c.slug}`} inline={1} mt={2}>
            <View mt={2} key={c.slug} fdirection="row" align="center">
              <Image source={c.image} h={4} w={4} />
              <Title ml={1}>{c.name} </Title>
            </View>
            <BodyText inline={1}>
              {c.description}
              {c.description}
            </BodyText>
          </ULink>
        ))}
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
