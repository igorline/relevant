import React from 'react';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const CommunityRedirect = withRouter(props => {
  const { community } = props;
  let activeCommunity = 'relevant';
  if (community.active && community.active !== 'undefined') {
    activeCommunity = community.active;
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
  actions: bindActionCreators(
    {
      // showModal,
      // forgotPassword
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunityRedirect);
