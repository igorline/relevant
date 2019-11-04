import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { showModal, hideModal } from 'modules/navigation/navigation.actions';
import Modal from 'modules/ui/modals/modal.component';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import * as modals from './desktop.lookup';

ModalContainer.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

const isBrowser = process.env.BROWSER === true;

function ModalContainer({ location, history }) {
  const dispatch = useDispatch();
  const { modal: currentModal, modalData } = useSelector(state => state.navigation);
  const urlParams = queryString.parse(location.search);
  const { modal, modalParams } = urlParams;

  useEffect(() => {
    if ((!modal && currentModal) || (modal && currentModal && modal !== currentModal)) {
      const qString = queryString.stringify({
        ...urlParams,
        modal: currentModal,
        modalParams: JSON.stringify(modalData)
      });
      history.push({ search: qString });
    }
  }, [currentModal]); // eslint-disable-line

  useEffect(() => {
    if (!currentModal && modal && isBrowser) {
      const params = modalParams ? JSON.parse(modalParams) : null;
      dispatch(showModal(modal, params));
    }
    if (currentModal && !modal) dispatch(hideModal());
  }, [modal]); // eslint-disable-line

  if (!isBrowser) return null;

  const modalEl = !!currentModal && modals[modal];
  if (!modalEl) return null;

  const { Body, redirect, ...rest } = modalEl;

  const close = () => {
    dispatch(hideModal());
    closeModal(redirect, history, location);
  };

  return (
    <Modal close={close} name={currentModal} {...rest}>
      <Body close={close} />
    </Modal>
  );
}

function closeModal(redirect, history, location) {
  const queryParams = queryString.parse(location.search);
  if (queryParams.redirect) {
    history.push(queryParams.redirect);
  } else if (redirect) {
    history.push(redirect);
  } else {
    history.push(location.pathname);
  }
}

export default withRouter(ModalContainer);
