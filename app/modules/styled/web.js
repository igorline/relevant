import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { mixins, layout, fonts, colors } from 'app/styles';

export const StyledNavLink = styled(NavLink)`
  ${fonts.header};
  color: ${colors.grey};
  &.active {
    color: ${colors.black};
  }
  :hover {
    color: ${colors.black};
  }
  ${mixins.font}
  ${mixins.color}
  ${mixins.margin}
`;

export const View = styled.div`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.width}
  ${mixins.height}
`;

export const Text = styled.span`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.color}
`;

export const InlineText = styled.span`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.color}
`;

export const Image = styled.img`
  ${mixins.margin}
  ${mixins.height}
  ${mixins.width}
  ${mixins.padding}
  ${mixins.background}
  ${mixins.borderRadius}
  ${mixins.flex}
`;

export const ImageWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${mixins.margin}
  ${mixins.flex}
`;

export const Divider = styled.div`
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
  ${mixins.font}
  ${mixins.color}
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

export const Button = styled(Text)`
  ${layout.button}
`;
