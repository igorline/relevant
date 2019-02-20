import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { createInvite } from 'modules/admin/admin.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InviteModalComponent from 'modules/ui/web/inviteModal.component';

class InviteModalContainer extends Component {
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
  initialValues: {
    invitedByString: get(state, 'auth.user.name', '')
  }
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      createInvite
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteModalContainer);
