import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import EarningTooltip from 'modules/tooltip/web/postEarningTooltip.component';
// import styled from 'styled-components';
import { BodyText, Title, View } from 'modules/styled/uni';
import { colors } from 'app/styles';

const TextTooltipComponent = ({ text, title }) => (
  <View maxWidth={32} flex={1} fdirection={'column'}>
    {title ? (
      <Title c={colors.white} mb={1}>
        {title}
      </Title>
    ) : null}
    {text ? (
      <BodyText c={colors.white} flex={1}>
        {text}
      </BodyText>
    ) : null}
  </View>
);

TextTooltipComponent.propTypes = {
  text: PropTypes.string,
  title: PropTypes.string
};

const TOOLTIPS = {
  POST: {},
  EARNING: EarningTooltip,
  TEXT: TextTooltipComponent
};

// const StyledReactTooltip = styled(ReactTooltip)`
//   pointer-events: auto !important;
//   &.show  {
//     opacity: 1; !important;
//   }
//   /*
//   background-color: ${colors.white} !important;
//   box-shadow: 0 0 5px 2px #ccc;*/
//   box-shadow: 0px 2px 10px 0px ${colors.grey};
//   border-radius: 0 !important;
//   /* &:after {
//     display: none !important;
//   } */
//   padding: ${sizing(1.5)};
//   max-width: ${sizing(60)};
//   max-height: none !important;;
//   height: auto !important;;
//   display: flex;
//   flex: 1;
//   z-Index: 10000;
// `;

export const TextTooltip = ({ id, type, ...rest }) => (
  <ReactTooltip
    className="reactTooltip"
    id={id}
    effect="solid"
    type={type || 'light'}
    // delayHide={100}
    getContent={dataTip => {
      const data = JSON.parse(dataTip);
      if (!data) return null;

      const { type, props } = data; // eslint-disable-line
      if (!TOOLTIPS[type]) return null;

      const TT = TOOLTIPS[type];
      return <TT {...props} />;
    }}
    {...rest}
  />
);

TextTooltip.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  type: PropTypes.string
};

// export const CustomTooltip = ({ id, type }) => (
//   <StyledReactTooltip
//     className='reactTooltip'
//     id={id}
//     effect="solid"
//     type={type || 'light'}
//     delayHide={100}
//     getContent={dataTip => {
//       const data = JSON.parse(dataTip);
//       if (!data) return null;

//       const { type, props } = data; // eslint-disable-line
//       if (!TOOLTIPS[type]) return null;

//       const TT = TOOLTIPS[type];
//       return <TT {...props} />;
//     }}
//   />
// );

// CustomTooltip.propTypes = {
//   id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   type: PropTypes.string
// };
