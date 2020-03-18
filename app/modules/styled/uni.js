import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { mixins, layout, fonts, colors, sizing, size, isNative } from 'app/styles';
import { abbreviateNumber } from 'utils/numbers';
import { TouchableOpacity } from 'react-native';
import ULink from 'modules/navigation/ULink.component';

export const Touchable = TouchableOpacity;

export const Box = styled.View`
  ${mixins.margin}
  ${mixins.padding}
`;

export const View = styled.View`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.width}
  ${mixins.height}
  ${mixins.zIndex}
  ${mixins.borderRadius}
`;

export const AbsoluteView = styled.View`
  position: absolute;
  ${mixins.position}
`;

export const Text = styled.Text`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.color}
  ${mixins.height}
`;

export const InlineText = styled.Text`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.font}
  ${mixins.color}
`;

export const Image = styled.Image`
  ${mixins.margin}
  ${mixins.height}
  ${mixins.width}
  ${mixins.padding}
  ${mixins.background}
  ${mixins.borderRadius}
  ${mixins.flex}
`;

export const ImageWrapper = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${mixins.margin}
  ${mixins.flex}
`;

export const FormImage = props => <Image {...props} {...layout.formImageProps} />;

export const Divider = styled.View`
  ${mixins.margin}
  ${mixins.padding}
  ${p => {
    if (p.screenSize && p.screenSize > 0) {
      return `
        height: ${sizing(4)};
        background-color: ${colors.dividerBg};
      `;
    }
    return layout.universalBorder('bottom');
  }}
`;

export const MobileDivider = styled(View)`
  height: ${sizing(4)};
  background-color: ${colors.dividerBg};
`;

export const Header = styled.Text`
  ${fonts.header}
  ${mixins.color}
  ${mixins.margin}
`;

export const Highlight = styled.Text`
  ${fonts.highlight}
  ${mixins.color}
  ${mixins.margin}
`;

export const Title = styled.Text`
  ${fonts.title}
  ${mixins.color}
  ${mixins.font}
  ${mixins.flex}
  ${mixins.margin}
`;

export const LinkFont = styled.Text`
  ${fonts.link}
  ${mixins.link}
  ${mixins.font}
  ${mixins.color}
 ${mixins.margin}
  ${() => (!isNative ? 'user-select: none; cursor: pointer;' : '')}
`;

export const CTALink = styled.Text`
  ${fonts.CTALink}
  ${mixins.link}
  ${mixins.color}
  ${mixins.font}
  ${mixins.margin}
`;

export const SecondaryText = styled.Text`
  ${fonts.secondaryText}
  ${mixins.color}
  ${mixins.font}
 ${mixins.margin}
`;

export const SmallText = styled.Text`
  ${fonts.secondaryText}
  color: ${colors.black};
  ${mixins.color}
  ${mixins.font}
 ${mixins.margin}
`;

export const AltLink = styled.Text`
  ${fonts.altLink}
  ${mixins.color}
  ${mixins.font}
  ${mixins.margin}
`;

export const CommunityLink = styled.Text`
  ${fonts.communityLink}
  ${mixins.color}
  ${mixins.font}
  ${mixins.margin}
`;

export const CommentText = styled.Text`
  ${fonts.commentText}
  ${mixins.color}
  ${mixins.font}
  z-index: 1;
`;

export const BodyText = styled.Text`
  ${fonts.bodyStyle}
  ${mixins.color}
  ${mixins.font}
  ${mixins.margin}
`;

export const StaticButton = styled(View)`
  ${layout.button}
  ${p =>
    p.disabled
      ? `
      background: ${colors.grey};
    & > div {
      color: ${colors.white};
    }
    `
      : ''};
  ${mixins.width}
  ${mixins.height}
  ${mixins.margin}
  ${mixins.background}
  ${mixins.padding}
  ${mixins.border}
  ${mixins.borderRadius}
  ${p => (p.hover && !p.active && !p.disabled ? layout.activeButtonShadow : '')}
  ${() => (!isNative ? 'user-select: none; cursor: pointer;' : '')}
`;

export const ButtonText = styled.Text`
  ${layout.buttonFont}
  ${mixins.color}
`;

HB.propTypes = {
  children: PropTypes.node,
  onPress: PropTypes.func,
  onClick: PropTypes.func
};

export const HoverButton = memo(HB);

function HB({ children, onPress, onClick, ...rest }) {
  const [hover, setHover] = useState(0);
  const [active, setActive] = useState(0);
  const isString = typeof children === 'string';
  const isArray = typeof children === 'object' && children.length;
  const isTextArray = isArray && children.find(el => typeof el === 'string');
  const renderString =
    !children || (!isArray && !children.$$typeof) || isTextArray || isString;
  return (
    <TouchableOpacity onClick={onClick} onPress={onPress}>
      <StaticButton
        hover={hover}
        active={active}
        onMouseDown={() => setActive(1)}
        onMouseUp={() => setActive(0)}
        onMouseEnter={() => setHover(1)}
        onMouseLeave={() => {
          setHover(0);
          setActive(0);
        }}
        {...rest}
      >
        {renderString ? <ButtonText {...rest}>{children}</ButtonText> : children}
      </StaticButton>
    </TouchableOpacity>
  );
}

export const Button = memo(HB);

ButtonWithIcon.propTypes = {
  text: PropTypes.string,
  image: PropTypes.node
};

export function ButtonWithIcon({ text, image, ...rest }) {
  return (
    <ViewButton fdirection={'row'} {...rest}>
      {image}
      <ButtonText>{text}</ButtonText>
    </ViewButton>
  );
}

export const ViewButton = styled(View)`
  ${layout.button}
  ${() => (!isNative ? 'cursor: pointer;' : '')}
  ${p =>
    p.disabled
      ? `
    background: ${colors.grey};
    `
      : ''};
  ${mixins.background}
  ${mixins.padding}
  ${mixins.margin}
`;

export const Tag = styled(Text)`
  ${layout.tag}
  ${p =>
    p.disabled
      ? `
    color: ${colors.grey};
    background: ${colors.secondaryBG};
    `
      : ''};
  ${mixins.background}
  ${mixins.padding}
  ${mixins.margin}
  ${mixins.color}
`;

export const NumericalValue = styled(Text)`
  ${fonts.numericalValue}
  ${mixins.width}
  ${mixins.font}
  ${mixins.inheritfont}
  ${mixins.color}
`;

export const BigNumber = styled(NumericalValue)`
  ${fonts.bigNumber}
`;

export const Spacer = styled(View)`
  flex-direction: row;
  position: relative;
  ${p => {
    if (Number.isInteger(p.nestingLevel) || Number.isInteger(p.additionalNesting)) {
      const total = (p.nestingLevel || 0) + (p.additionalNesting || 0);
      const UNIT = p.screenSize > 0 ? layout.NESTING_UNIT_RESONSIVE : layout.NESTING_UNIT;
      if (!total * UNIT) {
        return '';
      }
      return `padding-left: ${sizing((total - (p.screenSize > 0 ? 1 : 0)) * UNIT)};`;
    }
    return '';
  }}
  flex-grow: 1;
  ${mixins.flex}
`;

export const CloseX = styled(Image)`
  position: absolute;
  ${p => (p.position ? `position: ${p.position};` : null)}
  ${p => (p.top ? `top: ${size(p.top)};` : null)}
  ${p => (p.right ? `right: ${size(p.right)};` : null)}
  ${() => (!isNative ? 'user-select: none; cursor: pointer;' : '')}
  z-index: 10;
`;

export const Warning = styled(SmallText)`
  color: ${colors.warning};
`;

export const Overlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.modalBackground};
`;

// export const Badge = styled(View)`
//   border-radius: 100%;
//   align-items: center;
//   justify-content: center;
//   display: flex;
//   flex-direction: row;
// `;
Badge.propTypes = {
  color: PropTypes.string,
  textColor: PropTypes.string,
  h: PropTypes.number,
  children: PropTypes.node,
  number: PropTypes.number
};

export function Badge({ color, textColor, h, children, number, ...styles }) {
  if (!number) return null;
  return (
    <View
      minwidth={h || 1.75}
      p={'0 0.5'}
      h={h || 1.75}
      bradius={(h || 1.75) / 2}
      align={'center'}
      justify={'center'}
      bg={color || colors.blue}
      {...styles}
    >
      <NumericalValue fs={1.25} lh={h || 1.75} c={textColor || colors.white}>
        {abbreviateNumber(number)}
      </NumericalValue>
    </View>
  );
}

export const Err = styled(Text)`
  color: ${colors.red};
`;

EthAddress.propTypes = {
  address: PropTypes.object
};

export function EthAddress({ address }) {
  if (!address) return null;
  return (
    <ULink to={`https://etherscan.io/address/${address}`} target="_blank" external>
      {address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)}
    </ULink>
  );
}

export const ErrorBox = ({ children, ...styleProps }) => (
  <View mt={2} p={2} bg={colors.errorA} border bc={colors.error} {...styleProps}>
    {children}
  </View>
);

export const WarningBox = ({ children, ...styleProps }) => (
  <View mt={2} p={2} bg={colors.warningA} border bc={colors.warning} {...styleProps}>
    {children}
  </View>
);

ErrorBox.propTypes = {
  children: PropTypes.node
};

WarningBox.propTypes = {
  children: PropTypes.node,
  styleProps: PropTypes.object
};
