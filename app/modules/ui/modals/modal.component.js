import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import styled from 'styled-components/primitives';
import { View, Header, Touchable, CloseX } from 'modules/styled/uni';
import { colors, layout } from 'app/styles';
import { hideModal } from 'modules/navigation/navigation.actions';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

const DEFAULT_WIDTH = 95;
const DEFAULT_PADDING = 6;

const ModalParent = styled.View`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  background-color: ${colors.modalBackground};
  z-index: 200;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const ModalScroll = styled.View`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 100vh;
  justify-content: center;
`;

const Modal = styled(View)`
  z-index: 5;
  ${layout.modalShadow}
  max-width: 100vw;
`;

ModalComponent.propTypes = {
  header: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  hideX: PropTypes.bool,
  children: PropTypes.node,
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  padding: PropTypes.number,
  close: PropTypes.func
};

function ModalComponent(props) {
  const { footer, children, hideX, maxWidth, padding, header, title } = props;

  const dispatch = useDispatch();
  const close = props.close || (() => dispatch(hideModal()));

  const modalElement = useRef(null);

  const headerEl = header || title;
  const footerEl = typeof footer === 'function' ? footer(props) : footer;

  useEffect(() => {
    const el = modalElement.current;
    disableBodyScroll(el);
    return () => enableBodyScroll(el);
  }, [modalElement]);

  const closeModal = useCallback(() => close(), [close]);

  useEffect(() => {
    const escFunction = e => (e.keyCode === 27 ? closeModal() : null);
    document.addEventListener('keydown', escFunction, false);
    return () => document.removeEventListener('keydown', escFunction, false);
  }, [closeModal]);

  const p = padding || [DEFAULT_PADDING, '6 3'];

  return (
    <ModalParent onClick={closeModal} ref={modalElement}>
      <ModalScroll ignoreScrollLock>
        <Modal
          ignoreScrollLock
          bg={colors.white}
          w={maxWidth || [DEFAULT_WIDTH, '100vw']}
          p={p}
          justify={['space-between', 'center']}
          fdirection="column"
          m={['6 0', '0']}
          minHeight={['auto', maxWidth ? 'auto' : '100vh']}
          onClick={e => e.stopPropagation()}
        >
          {hideX ? null : (
            <Touchable onClick={closeModal}>
              <CloseX
                w={2.5}
                h={2.5}
                top={[4, 3]}
                right={[4, 3]}
                resizeMode={'contain'}
                source={require('app/public/img/x.png')}
              />
            </Touchable>
          )}
          {headerEl ? (
            <Header pr={5} mb={3} shrink={1}>
              {headerEl}
            </Header>
          ) : null}
          {children}
          {footerEl && <View mt={6}>{footerEl}</View>}
        </Modal>
      </ModalScroll>
    </ModalParent>
  );
}

export default props => {
  const modal = useSelector(state => state.navigation.modal);
  const { name } = props;
  const visible = name && name === modal;
  return visible && document
    ? ReactDOM.createPortal(<ModalComponent {...props} />, document.body)
    : null;
};
