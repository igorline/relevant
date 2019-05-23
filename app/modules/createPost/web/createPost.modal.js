import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { hideModal, showModal } from 'modules/navigation/navigation.actions';
import { setCommunity } from 'modules/auth/auth.actions';
import { withRouter } from 'react-router-dom';
import loadable from '@loadable/component';

const Modal = loadable(() => import('modules/ui/web/modal'));
const CreatePost = loadable(() => import('modules/createPost/createPost.container'));
const ModalHeader = loadable(() =>
  import('modules/createPost/web/createPostModal.header')
);

function CreatePostModal(props) {
  const { visible, actions } = props;
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      close={actions.hideModal}
      header={<ModalHeader {...props} />}
    >
      <CreatePost modal close={actions.hideModal} />
    </Modal>
  );
}

CreatePostModal.propTypes = {
  visible: PropTypes.bool,
  actions: PropTypes.object
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
    community: state.community
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        setCommunity,
        hideModal,
        showModal
      },
      dispatch
    )
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CreatePostModal)
);
