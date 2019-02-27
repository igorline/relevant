import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { sendConfirmation } from 'modules/auth/auth.actions';
import { showModal } from 'modules/navigation/navigation.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GetTokensModal from 'modules/ui/web/getTokensModal.component';

class GetTokensModalContainer extends Component {
  render() {
    return <GetTokensModal {...this.props} />;
  }
}

GetTokensModalContainer.propTypes = {
  actions: PropTypes.object,
  close: PropTypes.func,
  auth: PropTypes.object
};

const mapStateToProps = state => ({
  auth: get(state, 'auth', {}) || {}
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      // createInvite,
      // getInviteCount
      sendConfirmation,
      showModal
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GetTokensModalContainer);
