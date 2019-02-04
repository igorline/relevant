import styled from 'styled-components/primitives';
import { mixins, layout, fonts } from 'app/styles';

export const View = styled.View`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.width}
  ${mixins.height}
`;

export const Text = styled.Text`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.color}
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
  ${mixins.padding}
  ${mixins.background}
  ${mixins.borderRadius}
  ${mixins.flex}
`;

export const ImageWrapper = styled.Text`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${mixins.margin}
  ${mixins.flex}
`;

export const Divider = styled.View`
  ${mixins.margin}
  ${mixins.padding}
  ${layout.universalBorder('bottom')}
`;

export const Header = styled(Text)`
  ${fonts.header}
  ${mixins.color}
`;

export const Title = styled(Text)`
  ${fonts.title}
  ${mixins.color}
  ${mixins.font}
`;

export const LinkFont = styled(Text)`
  ${fonts.link}
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

export const CommentText = styled(Text)`
  ${fonts.commentText}
  ${mixins.color}
  ${mixins.font}
`;

export const BodyText = styled(Text)`
  ${fonts.bodyStyle}
  ${mixins.color}
  ${mixins.font}
`;

export const Touchable = styled.Touchable`
`;

export const Button = styled(Text)`
  ${layout.button}
`;

export const NumericalValue = styled(Text)`
  ${fonts.numericalValue}
  ${mixins.inheritfont}
  ${mixins.color}
`;
