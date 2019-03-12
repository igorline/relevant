import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { View, Image, Header, Touchable } from 'modules/styled/uni';
import { colors, mixins, layout } from 'app/styles';

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
  overflow: scroll;
`;

const ModalScroll = styled.View`
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

const CloseButton = styled(Image)`
  position: absolute;
  ${p => (p.top ? `top: ${mixins.size(p.top)};` : null)}
  ${p => (p.right ? `right: ${mixins.size(p.right)};` : null)}
  cursor: pointer;
  z-index: 10;
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
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  render() {
    const { close, footer, children, hideX } = this.props;
    const header = this.props.header || this.props.title;
    if (!this.props.visible) return null;
    const footerEl = typeof footer === 'function' ? footer(this.props) : footer;
    return (
      <ModalParent onClick={close}>
        <ModalScroll>
          <Modal
            bg={colors.white}
            w={[95, '100vw']}
            p={[6, 3]}
            justify={['space-between', 'center']}
            fdirection="column"
            margin={['6 0', '3 0']}
            minHeight={['auto', '100vh']}
            onClick={e => e.stopPropagation()}
          >
            {hideX ? null : (
              <Touchable onPress={() => close()}>
                <CloseButton
                  w={3}
                  h={3}
                  top={[6, 3]}
                  right={[6, 3]}
                  resizeMode={'contain'}
                  source={require('app/public/img/x.png')}
                />
              </Touchable>
            )}
            {header ? <Header>{this.props.header || this.props.title}</Header> : null}
            {children && <View mt={3}>{children}</View>}
            {footerEl && <View mt={6}>{footerEl}</View>}
          </Modal>
        </ModalScroll>
      </ModalParent>
    );
  }
}
