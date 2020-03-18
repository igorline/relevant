import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { mixins, layout, fonts, colors, sizing } from 'app/styles';
import TextareaAutosize from 'react-textarea-autosize';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';

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
  ${p => (p.onClick ? 'cursor: pointer;' : '')}
`;

export const Text = styled.span`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
  ${mixins.font}
  ${mixins.background}
  ${mixins.border}
  ${mixins.color}
  ${p => (p.onClick ? 'cursor: pointer;' : '')}
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
  ${layout.buttonFont}
  ${p =>
    p.disabled
      ? `
    color: ${colors.white};
    background: ${colors.grey};
    `
      : ''};
  ${mixins.flex}
  ${mixins.background}
  ${mixins.padding}
  ${mixins.width}
  ${mixins.margin}
  ${mixins.color}
  ${mixins.width}
  ${mixins.height}
  &:hover {
    ${layout.activeButtonShadow}
  };
  user-select: none; cursor: pointer;
`;

export const NumericalValue = styled(Text)`
  ${fonts.numericalValue}
  ${mixins.width}
  ${mixins.font}
  ${mixins.inheritfont}
  ${mixins.color}
`;

export const InputPlain = styled.input`
  ${mixins.font}
  ${mixins.flex}
  ${mixins.border}
  ${mixins.padding}
  ${mixins.margin}
  ::placeholder: {
    font-size: ${sizing(1.75)};
    line-height: ${sizing(1.75)};
  };
  :focus {
    outline: none !important;
    ${layout.universalBorder('', colors.blue)}
  }
`;

export const Input = styled.input`
  padding: ${sizing(2)} ${sizing(2)};
  margin-top: ${sizing(1)};  ${fonts.bodyStyle}
  ${mixins.font}
  ${mixins.flex}
  ${mixins.border}
  ${layout.universalBorder()}
  ${mixins.padding}
  ${mixins.margin}
  ::placeholder: {
    font-size: ${sizing(1.75)};
    line-height: ${sizing(1.75)};
  };
  :focus {
    outline: none !important;
    ${layout.universalBorder('', colors.blue)}
  }
`;

export const StyledTextareaAutocomplete = styled(ReactTextareaAutocomplete)`
  ${fonts.bodyStyle}
  ${mixins.border}
  ${mixins.flex}
  ${layout.universalBorder()}
  padding: ${sizing(2)} ${sizing(2)};
  min-width: 0;
  &: focus {
    outline: 1px solid ${colors.blue};
  }
  ${mixins.padding}
  ${mixins.margin}
  ${mixins.height}
`;

export const StyledTextarea = styled(TextareaAutosize)`
  ${fonts.bodyStyle}
  ${mixins.border}
  ${mixins.flex}
  ${layout.universalBorder()}
  padding: ${sizing(2)} ${sizing(2)};
  min-width: 0;
  &: focus {
    outline: 1px solid ${colors.blue};
  }
  ${mixins.padding}
  ${mixins.margin}
  ${mixins.height}
`;

export const Form = styled.form`
  ${mixins.flex}
  ${mixins.margin}
`;

export const Video = styled.video`
  ${mixins.margin}
  ${mixins.height}
  ${mixins.width}
  ${mixins.padding}
  ${mixins.background}
  ${mixins.borderRadius}
  ${mixins.flex}
`;
