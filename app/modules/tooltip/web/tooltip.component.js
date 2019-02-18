import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import EarningTooltip from 'modules/tooltip/web/postEarningTooltip.component';
import styled from 'styled-components';
import { colors, sizing } from 'app/styles';

const TextTooltip = props => `${props.text}`;

const TOOLTIPS = {
  POST: {},
  EARNING: EarningTooltip,
  TEXT: TextTooltip
};

const StyledReactTooltip = styled(ReactTooltip)`
  fontsize: 20px !important;
  pointer-events: auto !important;
  &:hover {
    visibility: visible !important;
  }
  opacity: 1 !important;
  background-color: ${colors.white} !important;
  box-shadow: 10px 10px 10px -10px ${colors.grey};
  box-shadow: 0 0 5px 2px #ccc;
  border-radius: 0 !important;
  &:after {
    display: none !important;
  }
  padding: ${sizing(1.5)};
  max-width: ${sizing(80)};
  overflow: hidden;
`;

const Tooltip = ({ id }) => (
  <StyledReactTooltip
    id={id}
    effect="solid"
    type={'lightt'}
    delayHide={100}
    getContent={dataTip => {
      const data = JSON.parse(dataTip);
      if (!data) {
        return null;
      }
      const { type, props } = data;
      if (!TOOLTIPS[type]) {
        return null;
      }
      const TT = TOOLTIPS[type];
      return <TT {...props} />;
    }}
  />
);

Tooltip.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default Tooltip;
