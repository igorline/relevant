import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import TwitterIcon from 'app/public/img/twitter.svg';
import SlackIcon from 'app/public/img/slack-white.svg';
import EmailIcon from 'app/public/img/email.svg';

const greyText = '#717171';

const StyledLink = styled.a`
  color: ${greyText};
  text-decoration: underline;
  &:hover {
    color: black;
  }
`;

const StyledIconLink = styled(StyledLink)`
  color: black;
  font-weight: bold;
  height: 32px;
  width: 32px;
  margin-right: 2em;
  &:hover svg * {
    fill: grey;
  }
  svg * {
    fill: black;

  }
  svg {
    height: 30px;
    width: 30px;
  }
`;

const Footer = styled.div`
  margin: 2em;
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
      <StyledLink to="/eula.html" target="_blank">Content Policy</StyledLink> | <StyledLink to="/privacy.html" target="_blank"> Privacy Policy</StyledLink>
    </p>
    <IconContainer>
      {icons.map(icon => <FooterIcon key={icon.href} {...icon} />)}
    </IconContainer>
  </Footer>
);

export default SideNavFooter;
