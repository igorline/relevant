import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { View, Header, Touchable, CloseX } from 'modules/styled/uni';
import { colors, layout } from 'app/styles';
// import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

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

export default class ModalComponent extends Component {
  static propTypes = {
    header: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    visible: PropTypes.bool,
    hideX: PropTypes.bool,
    close: PropTypes.func,
    children: PropTypes.node,
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
  };

  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.visible) {
        this.props.close();
      }
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.escFunction, false);
    // disableBodyScroll(this.targetElement, {
    //   allowTouchMove: el => {
    //     while (el && el !== document.body) {
    //       if (el.getAttribute('body-scroll-lock-ignore') !== null) {
    //         return true;
    //       }
    //       el = el.parentNode;
    //     }
    //   },
    // allowTouchMove: el => {
    //   console.log(el, el.getAttribute('ignoreScrollLock'));
    //   return el.getAttribute('ignoreScrollLock') !== null;
    // }
    // });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
    // clearAllBodyScrollLocks();
  }

  render() {
    const { close, footer, children, hideX, header, title } = this.props;
    if (!this.props.visible) return null;
    const footerEl = typeof footer === 'function' ? footer(this.props) : footer;
    return (
      <ModalParent onClick={close} ref={c => (this.targetElement = c)}>
        <ModalScroll ignoreScrollLock>
          <Modal
            ignoreScrollLock
            bg={colors.white}
            w={[95, '100vw']}
            p={[6, 3]}
            justify={['space-between', 'center']}
            fdirection="column"
            m={['6 0', '0']}
            minHeight={['auto', '100vh']}
            onClick={e => e.stopPropagation()}
          >
            {hideX ? null : (
              <Touchable onPress={() => close()}>
                <CloseX
                  w={3}
                  h={3}
                  top={[6, 3]}
                  right={[6, 3]}
                  resizeMode={'contain'}
                  source={require('app/public/img/x.png')}
                />
              </Touchable>
            )}
            {header ? (
              this.props.header
            ) : (
              <Header pr={5} shrink={1}>
                {title}
              </Header>
            )}
            {children && <View mt={3}>{children}</View>}
            {footerEl && <View mt={6}>{footerEl}</View>}
          </Modal>
        </ModalScroll>
      </ModalParent>
    );
  }
}
