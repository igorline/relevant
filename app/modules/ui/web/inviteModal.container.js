import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { createInvite, getInviteCount } from 'modules/admin/admin.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InviteModalComponent from 'modules/ui/web/inviteModal.component';

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
  initialValues: {
    invitedByString: get(state, 'auth.user.name', '')
  }
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      createInvite,
      getInviteCount
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteModalContainer);
