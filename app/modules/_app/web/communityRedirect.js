import React from 'react';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const CommunityRedirect = withRouter(props => {
  const { community } = props;
  let activeCommunity;
  if (community.active && community.active !== 'undefined') {
    activeCommunity = community.active;
  }
  if (
    !activeCommunity ||
    activeCommunity === 'undefined' ||
    activeCommunity === undefined
  ) {
    activeCommunity = 'relevant';
  }
  return <Redirect {...props} to={`/${activeCommunity}/new`} />;
});

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth,
  community: state.community,
  initialValues: {},
  enableReinitialize: true
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({}, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunityRedirect);
