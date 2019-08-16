import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import styled from 'styled-components/primitives';
import { View, Header, Touchable, CloseX } from 'modules/styled/uni';
import { colors, layout } from 'app/styles';
// import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

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

const ModalComponent = props => {
  const {
    close,
    footer,
    children,
    hideX,
    visible,
    maxWidth,
    padding,
    header,
    title
  } = props;

  const escFunction = e => {
    e.keyCode === 27 && visible ? close() : null;
  };
  const targetElement = useRef(null);

  const headerEl = header || title;
  if (!visible) return null;
  const footerEl = typeof footer === 'function' ? footer(props) : footer;

  // TODO work on locking scroll:
  // useEffect(() => {
  //   disableBodyScroll(this.targetElement, {
  //     allowTouchMove: el => {
  //       while (el && el !== document.body) {
  //         if (el.getAttribute('body-scroll-lock-ignore') !== null) {
  //           return true;
  //         }
  //         el = el.parentNode;
  //       }
  //     },
  //     allowTouchMove: el => {
  //       console.log(el, el.getAttribute('ignoreScrollLock'));
  //       return el.getAttribute('ignoreScrollLock') !== null;
  //     }
  //   });
  //   return clearAllBodyScrollLocks();
  // }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);
    return () => document.removeEventListener('keydown', escFunction, false);
  }, []);

  const p = padding || [DEFAULT_PADDING, '6 3'];

  return (
    <ModalParent onClick={close} ref={targetElement}>
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
            <Touchable onClick={() => close()}>
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
};

ModalComponent.propTypes = {
  header: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  visible: PropTypes.bool,
  hideX: PropTypes.bool,
  close: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  padding: PropTypes.number
};

export default props =>
  props.visible && document
    ? ReactDOM.createPortal(<ModalComponent {...props} />, document.body)
    : null;
