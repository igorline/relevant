import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { mixins, layout, fonts, colors, sizing } from 'app/styles';
import Textarea from 'react-textarea-autosize';

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
  ${mixins.display}
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
  ${mixins.width}
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

export const Button = styled.button`
  ${layout.button}
  ${p =>
    p.disabled
      ? `
    color: ${colors.white};
    background: ${colors.grey};
    `
      : ''};
  ${mixins.background}
  ${mixins.padding}
  ${mixins.width}
  ${mixins.margin}
  ${mixins.color}
`;

export const Input = styled.input`
  ${fonts.bodyStyle}
  ${mixins.padding}
  ${mixins.border}
  ${layout.universalBorder()}
  padding: ${sizing(2)} ${sizing(2)};
  margin-top: ${sizing(1)};
  ::placeholder: {
    font-size: ${sizing(1.75)};
    line-height: ${sizing(1.75)};
  };
  &: focus {
    outline: none;
    ${layout.universalBorder('', colors.blue)}
  }
`;

export const StyledTextarea = styled(Textarea)`
  ${fonts.bodyStyle}
  ${mixins.border}
  ${mixins.flex}
  ${layout.universalBorder()}
  padding: ${sizing(2)} ${sizing(2)};
  ${mixins.padding}
  ${mixins.margin}
  min-width: 0;
  &: focus {
    min-height: ${sizing(8)};
    outline: 1px solid ${colors.blue};
  }
`;

export const Form = styled.form`
  ${mixins.flex}
  ${mixins.margin}
`;
