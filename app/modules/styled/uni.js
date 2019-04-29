import styled from 'styled-components/primitives';
import { mixins, layout, fonts, colors, sizing } from 'app/styles';

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
  ${mixins.background}
  ${mixins.border}
  ${mixins.color}
`;

export const Image = styled.Image`
  ${mixins.margin}
  ${mixins.height}
  ${mixins.width}
  ${mixins.link}
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

export const FormImage = props => (
  <Image {...props} bg={colors.blue} {...layout.formImageProps} />
);

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

export const Header = styled(Text)`
  ${fonts.header}
  ${mixins.color}
`;

export const Title = styled(Text)`
  ${fonts.title}
  ${mixins.color}
  ${mixins.font}
  ${mixins.flex}
`;

export const LinkFont = styled(Text)`
  ${fonts.link}
  ${mixins.link}
  ${mixins.font}
  ${mixins.color}
`;

export const CTALink = styled(Text)`
  ${fonts.CTALink}
  ${mixins.link}
  ${mixins.color}
  ${mixins.font}
`;

export const SecondaryText = styled(Text)`
  ${fonts.secondaryText}
  ${mixins.color}
  ${mixins.font}
`;

export const AltLink = styled(Text)`
  ${fonts.altLink}
  ${mixins.color}
  ${mixins.font}
`;

export const CommunityLink = styled(Text)`
  ${fonts.communityLink}
  ${mixins.color}
  ${mixins.font}
`;

export const CommentText = styled(Text)`
  ${fonts.commentText}
  ${mixins.color}
  ${mixins.font}
  z-index: 1;
`;

export const BodyText = styled(Text)`
  ${fonts.bodyStyle}
  ${mixins.color}
  ${mixins.font}
`;

export const Touchable = styled.Touchable``;

export const Button = styled(Text)`
  ${layout.button}
  ${layout.buttonFont}
  ${p => (!p.mobile ? 'cursor: pointer;' : '')}
  ${p =>
    p.disabled
      ? `
    color: ${colors.white};
    background: ${colors.grey};
    `
      : ''};
  ${mixins.margin}
  ${mixins.background}
  ${mixins.padding}
  ${mixins.color}
`;

export const ViewButton = styled(View)`
  ${layout.button}
  ${p => (!p.mobile ? 'cursor: pointer;' : '')}
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
      return `padding-left: ${sizing(total * UNIT)};`;
    }
    return '';
  }}
  flex-grow: 1;
  ${mixins.flex}
`;

export const CloseX = styled(Image)`
  position: absolute;
  ${p => (p.top ? `top: ${mixins.size(p.top)};` : null)}
  ${p => (p.right ? `right: ${mixins.size(p.right)};` : null)}
  cursor: pointer;
  z-index: 10;
`;
