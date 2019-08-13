import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { setupMobileTooltips } from 'modules/tooltip/mobile/setupTooltips';
import ReactTooltip from 'react-tooltip';

const AbsoluteWrapper = styled.Text`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
  z-index: 1;
`;

TooltipContainer.propTypes = {
  name: PropTypes.string,
  data: PropTypes.object,
  children: PropTypes.object
};

export default function TooltipContainer({ children, name, data, ...rest }) {
  useEffect(() => {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
  }, [data, name, children]);

  useEffect(() => data.shouldRegister && initTooltip(), []);

  const dispatch = useDispatch();
  const el = useRef();
  const { toggleTooltip, initTooltip } = setupMobileTooltips({
    tooltips: [{ name, el, data }],
    dispatch
  });

  const Wrapper = children ? View : AbsoluteWrapper;

  return (
    <Wrapper
      {...rest}
      ref={el}
      global-event-off="click"
      data-place={data.position}
      data-for="mainTooltip"
      data-tip={JSON.stringify({
        type: 'TEXT',
        props: data
      })}
      // pointerEvents="none"
      onPress={data.desktopOnly ? null : () => toggleTooltip(name)}
    >
      {children}
    </Wrapper>
  );
}
