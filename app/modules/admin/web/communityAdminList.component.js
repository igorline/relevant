import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as communityActions from 'modules/community/community.actions';
import ULink from 'modules/navigation/ULink.component';
import { Button, View } from 'modules/styled/web';

class CommunityAdminList extends Component {
  static propTypes = {
    // actions: PropTypes.object,
    community: PropTypes.object
  };

  render() {
    const {
      community: { communities }
    } = this.props;
    return (
      <View m={4} fdirection="column">
        {Object.values(communities).map(c => (
          <View mt={2} key={c.slug}>
            <ULink to={`/admin/community/${c.slug}`}>{c.name}</ULink>
          </View>
        ))}
        <View mt={2}>
          <ULink to="/admin/community/new" m={0}>
            <Button to="/admin/community/new" ml={0}>
              Create New
            </Button>
          </ULink>
        </View>
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
      ...communityActions
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
