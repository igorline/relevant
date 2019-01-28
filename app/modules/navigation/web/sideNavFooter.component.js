import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TwitterIcon from 'app/public/img/twitter.svg';
import SlackIcon from 'app/public/img/slack-white.svg';
import EmailIcon from 'app/public/img/email.svg';
import { sizing, colors } from 'app/styles';

const StyledLink = styled.a`
  color: ${colors.blue};
  text-decoration: underline;
  &:hover {
    text-decoration: none;
  }
`;

const StyledIconLink = styled(StyledLink)`
  height: ${sizing.byUnit(3)};
  width: ${sizing.byUnit(3)};
  color: ${colors.black};
  margin-right: ${sizing.byUnit(2)};

  &:hover svg * {
    fill: ${colors.grey};
  }
  svg * {
    fill: ${colors.black};
  }
  svg {
    height: ${sizing.byUnit(3)};
    width: ${sizing.byUnit(3)};
  }
`;

const Footer = styled.div`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(2)};
  margin: ${sizing.byUnit(4)};
`;

const IconContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: start;
  align-items: center;
`;

const FooterIcon = ({ href, Image, target }) => (
  <StyledIconLink href={`${href}`} target={target || '_self'}>
    <Image />
  </StyledIconLink>
);

FooterIcon.propTypes = {
  href: PropTypes.string,
  Image: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
  target: PropTypes.string,
};

const icons = [
  {
    href: 'https://twitter.com/relevantfeed',
    Image: TwitterIcon,
    target: '_blank',
  },
  {
    href: 'https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLTFkOTkwNzFjN2EzMjFhYTVkZDZmYzU1ZGFlZmY4MzdjNGMyOWIwYjhmYTE2OTQ1NmJlOWVmNjkyODNjM2I4YWI',
    Image: SlackIcon,
    target: '_blank',
  },
  {
    href: 'mailto:contact@4real.io',
    Image: EmailIcon,
    target: '_blank',
  }
];

const SideNavFooter = () => (
  <Footer>
    <p>© 2018 Relevant Community Inc.</p>
    <p>
      <StyledLink to="/eula.html" target="_blank">
        Content Policy
      </StyledLink> | <StyledLink to="/privacy.html" target="_blank">
        Privacy Policy
      </StyledLink>
    </p>
    <IconContainer>
      {icons.map(icon => <FooterIcon key={icon.href} {...icon} />)}
    </IconContainer>
  </Footer>
);

export default SideNavFooter;
