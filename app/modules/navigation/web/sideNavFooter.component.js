import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Footer = styled.div`
  margin: 2em;
`;

const IconContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  img {
    width: 30px;
    color: black;
    fill: black;
  }
`;

// <img src={require(`.${imgSrc}`)} />
//

const FooterIcon = ({ href, imgSrc, target }) => (
  <a href={href} target={target || '_self'} key={href}>
    <img src={imgSrc} />
  </a>
);

// <img dangerouslySetInnerHTML={{ __html: require(imgSrc) }} />
const icons = [
  {
    href: 'https://twitter.com/relevantfeed',
    imgSrc: '/img/twitter.svg',
    target: '_blank',
  },
  {
    href: 'https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLTFkOTkwNzFjN2EzMjFhYTVkZDZmYzU1ZGFlZmY4MzdjNGMyOWIwYjhmYTE2OTQ1NmJlOWVmNjkyODNjM2I4YWI',
    imgSrc: '/img/slack-white.svg',
    target: '_blank',
  },
  {
    href: 'mailto:contact@4real.io',
    imgSrc: '/img/email.svg',
    target: '_blank',
  }
];

const SideNavFooter = (props) => {
  return (
    <Footer>
      <IconContainer>
        {icons.map(icon => <FooterIcon {...icon} />)}
      </IconContainer>
      <p>© 2018 Relevant Community Inc.</p>
      <p>
        <Link to="/eula.html" target="_blank">Content Policy</Link> | <Link to="/privacy.html" target="_blank"> Privacy Policy</Link>
      </p>
    </Footer>
  );
};

export default SideNavFooter;
