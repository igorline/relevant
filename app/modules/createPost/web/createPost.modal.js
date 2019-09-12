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

CreatePostModal.propTypes = {
  name: PropTypes.string,
  actions: PropTypes.object
};

function CreatePostModal(props) {
  const { name, actions } = props;
  return (
    <Modal name={name} header={<ModalHeader {...props} />}>
      <CreatePost modal close={actions.hideModal} />
    </Modal>
  );
}

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
