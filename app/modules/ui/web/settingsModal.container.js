import React, { Component } from 'react';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import { s3 } from 'app/utils';
import { connect } from 'react-redux';
import { updateUser } from 'modules/auth/auth.actions';
import { bindActionCreators } from 'redux';
import SettingsModalComponent from 'modules/ui/web/settingsModal.component';

class SettingsModalContainer extends Component {
  submit = async vals => {
    const allVals = Object.assign({}, vals);
    if (allVals.image && allVals.image.preview && allVals.image.fileName) {
      try {
        const image = await s3.toS3Advanced(
          allVals.image.preview,
          allVals.image.fileName
        );
        allVals.image = image.url;
        try {
          const { actions, close } = this.props;
          const resp = await actions.updateUser(allVals);
          if (resp) {
            close();
          }
        } catch (err) {
          // TODO: handle
        }
      } catch (err) {
        // TODO: handle image failure
      }
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
      updateUser
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsModalContainer);
