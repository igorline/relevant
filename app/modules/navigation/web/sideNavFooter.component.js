import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import twitterIcon from 'app/public/img/twitter.svg';
import slackIcon from 'app/public/img/slack-white.svg';
import emailIcon from 'app/public/img/email.svg';

const greyText = '#717171';

const StyledLink = styled(Link)`
  color: ${greyText};
  text-decoration: underline;
  &:hover {
    color: black;
  }
`;

const StyledIconLink = styled(StyledLink)`
  color: black;
  font-weight: bold;
  height: 20px;
  width: 20px;
  margin-right: 2em;
`;

const SVGContainer = styled.div`
  svg * {
    fill: black;
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

const FooterIcon = ({ href, image, target }) => {
  return (
    <StyledIconLink to={href} target={target || '_self'} key={href}>
      <SVGContainer dangerouslySetInnerHTML={{ __html: image }} />
    </StyledIconLink>
  );
};

const icons = [
  {
    href: 'https://twitter.com/relevantfeed',
    image: twitterIcon,
    target: '_blank',
  },
  {
    href: 'https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLTFkOTkwNzFjN2EzMjFhYTVkZDZmYzU1ZGFlZmY4MzdjNGMyOWIwYjhmYTE2OTQ1NmJlOWVmNjkyODNjM2I4YWI',
    image: slackIcon,
    target: '_blank',
  },
  {
    href: 'mailto:contact@4real.io',
    image: emailIcon,
    target: '_blank',
  }
];

const SideNavFooter = (props) => {
  return (
    <Footer>
      <p>© 2018 Relevant Community Inc.</p>
      <p>
        <StyledLink to="/eula.html" target="_blank">Content Policy</StyledLink> | <StyledLink to="/privacy.html" target="_blank"> Privacy Policy</StyledLink>
      </p>
      <IconContainer>
        {icons.map(icon => <FooterIcon {...icon} />)}
      </IconContainer>
    </Footer>
  );
};

export default SideNavFooter;
