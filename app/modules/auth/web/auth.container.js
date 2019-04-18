import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { hideModal, showModal } from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';

class AuthContainer extends Component {
  static propTypes = {
    modal: PropTypes.bool,
    actions: PropTypes.object,
    user: PropTypes.object,
    match: PropTypes.object
  };

  componentDidMount() {
    this.openModal();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.modal !== this.props.match.params.modal) {
      this.openModal();
    }
  }

  openModal() {
    const { user, match } = this.props;
    let modal;
    if (match.params.modal) {
      modal = match.params.modal;
    }
    if (user && user.role === 'temp') {
      modal = 'setHandle';
    }
    if (modal === 'confirm') {
      this.props.actions.showModal('confirm');
    } else if (modal === 'forgot') {
      this.props.actions.showModal('forgot');
    } else if (modal === 'login') {
      this.props.actions.showModal('login');
    } else if (modal === 'signup') {
      this.props.actions.showModal('signupSocial');
    } else if (modal === 'setHandle') {
      this.props.actions.showModal('setHandle');
    } else if (modal === 'resetPassword') {
      this.props.actions.showModal('resetPassword');
    }
  }

  render() {
    return <div />;
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
      hideModal,
      showModal
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthContainer)
);
