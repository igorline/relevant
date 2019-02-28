import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { sendConfirmation, twitterAuth } from 'modules/auth/auth.actions';
import { showModal, push, reloadTab } from 'modules/navigation/navigation.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GetTokensModal from 'modules/getTokens/getTokensModal.component';
import { View } from 'modules/styled/uni';
import TwitterButton from 'modules/auth/mobile/TwitterButton.component';

class GetTokensModalContainer extends Component {
  render() {
    return (
      <View m={2} mt={4}>
        <GetTokensModal
          {...this.props}
          mobile
          twitterButton={
            <TwitterButton auth={this.props.auth} actions={this.props.actions} />
          }
        />
      </View>
    );
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
      sendConfirmation,
      showModal,
      push,
      twitterAuth,
      reloadTab
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GetTokensModalContainer);
