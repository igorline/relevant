import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Image, Text } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { setupMobileTooltips } from 'modules/tooltip/mobile/setupTooltips';
import ReactTooltip from 'react-tooltip';

const InfoImage = require('app/public/img/info.png');

const isNative = process.env.WEB !== 'true';

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
  children: PropTypes.object,
  info: PropTypes.bool,
  inline: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
};

export default function TooltipContainer({
  children,
  name,
  data,
  info,
  inline,
  ...rest
}) {
  useEffect(() => {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
  }, [data, name, children]);

  useEffect(() => data.shouldRegister && initTooltip(), [
    data.shouldRegister,
    initTooltip
  ]);

  const dispatch = useDispatch();
  const el = useRef();
  const { toggleTooltip, initTooltip } = setupMobileTooltips({
    tooltips: [{ name, el, data }],
    dispatch
  });

  const Wrapper = (children && View) || AbsoluteWrapper;

  return info ? (
    <Text
      ref={el}
      // onLongPress={() => toggleTooltip(name)}
      onPress={data.desktopOnly || !isNative ? null : () => toggleTooltip(name)}
      inline={inline}
    >
      <Image
        data-event-off="click"
        data-place={data.position}
        data-for="mainTooltip"
        data-tip={JSON.stringify({
          type: 'TEXT',
          props: data
        })}
        {...rest}
        source={InfoImage}
        resizeMode={'contain'}
        h={1.7}
        w={1.7}
        inline={inline}
        {...rest}
      />
    </Text>
  ) : (
    <Wrapper
      ref={el}
      data-event-off="click"
      data-place={data.position}
      data-for="mainTooltip"
      data-tip={JSON.stringify({
        type: 'TEXT',
        props: data
      })}
      onLongPress={() => toggleTooltip(name)}
      onPress={data.desktopOnly || !isNative ? null : () => toggleTooltip(name)}
    >
      {children}
    </Wrapper>
  );
}
