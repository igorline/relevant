import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { createInvite, getInviteCount, getInvites } from 'modules/admin/admin.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InviteModalComponent from 'modules/invites/inviteModal.component';

class InviteModalContainer extends Component {
  componentDidMount() {
    this.props.actions.getInviteCount();
  }

  render() {
    return <InviteModalComponent {...this.props} />;
  }
}

InviteModalContainer.propTypes = {
  actions: PropTypes.object,
  close: PropTypes.func,
  auth: PropTypes.object
};

const mapStateToProps = state => ({
  auth: get(state, 'auth', {}) || {},
  community: get(state, 'community', {}) || {},
  count: state.admin.count,
  invites: state.admin.invites,
  inviteList: state.admin.inviteList,
  initialValues: {
    invitedByString: get(state, 'auth.user.name', '')
  }
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      createInvite,
      getInviteCount,
      getInvites
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteModalContainer);
