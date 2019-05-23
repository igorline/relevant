import React, { Component } from 'react';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import { s3 } from 'app/utils';
import { connect } from 'react-redux';
import { updateUser } from 'modules/auth/auth.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { bindActionCreators } from 'redux';
import SettingsModalComponent from 'modules/profile/web/settingsModal.component';
import { browserAlerts } from 'app/utils/alert';

class SettingsModalContainer extends Component {
  submit = async vals => {
    try {
      const allVals = Object.assign({}, vals);
      const { actions, close } = this.props;
      if (allVals.image && allVals.image.preview && allVals.image.fileName) {
        const image = await s3.toS3Advanced(
          allVals.image.preview,
          allVals.image.fileName
        );
        allVals.image = image.url;
      }
      const resp = await actions.updateUser(allVals);
      if (resp) {
        close();
      }
    } catch (err) {
      browserAlerts.alert(err);
    }
  };

  render() {
    return <SettingsModalComponent {...this.props} onSubmit={this.submit} />;
  }
}

SettingsModalContainer.propTypes = {
  actions: PropTypes.object,
  close: PropTypes.func
};

const mapStateToProps = state => ({
  initialValues: get(state, 'auth.user', {}) || {},
  enableReinitialize: true
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      updateUser,
      ...navigationActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsModalContainer);
