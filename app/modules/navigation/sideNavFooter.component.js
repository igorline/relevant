import React from 'react';
import PropTypes from 'prop-types';
import { View, BodyText, Image, InlineText } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

const TwitterIcon = require('app/public/img/twitter-black.png');
const EmailIcon = require('app/public/img/email.png');
const SlackIcon = require('app/public/img/slack.png');
const MediumIcon = require('app/public/img/medium.png');

const FooterIcon = ({ href, source, target, actions }) => {
  if (!source) {
    return null;
  }
  return (
    <ULink
      external
      to={href}
      onPress={() => actions.goToUrl(href)}
      target={target || '_self'}
    >
      <Image w={3} h={2.3} mr={1.5} resizeMode={'contain'} source={source} />
    </ULink>
  );
};

FooterIcon.propTypes = {
  href: PropTypes.string,
  source: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  target: PropTypes.string,
  actions: PropTypes.object
};

const icons = [
  {
    href: 'https://twitter.com/relevantfeed',
    source: TwitterIcon,
    target: '_blank'
  },
  {
    href:
      'https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLTFkOTkwNzFjN2EzMjFhYTVkZDZmYzU1ZGFlZmY4MzdjNGMyOWIwYjhmYTE2OTQ1NmJlOWVmNjkyODNjM2I4YWI',
    source: SlackIcon,
    target: '_blank'
  },
  {
    href: 'mailto:info@relevant.community',
    source: EmailIcon,
    target: '_blank'
  },
  {
    href: 'https://blog.relevant.community',
    source: MediumIcon,
    target: '_blank'
  }
];

const SideNavFooter = ({ actions }) => (
  <View m={[4, 2]}>
    <BodyText>© 2019 Relevant Protocols Inc.</BodyText>
    <BodyText inline={1} mt={1}>
      <ULink to="/info/faq">
        <InlineText>FAQ</InlineText>
      </ULink>
      <InlineText> | </InlineText>
      <ULink to="/eula.html" external target="_blank">
        <InlineText>Content Policy</InlineText>
      </ULink>
      <InlineText> | </InlineText>
      <ULink external to="/privacy.html" target="_blank">
        <InlineText>Privacy Policy</InlineText>
      </ULink>
    </BodyText>
    <View flex={1} fdirection={'row'} mt={2} mb={2}>
      {icons.map(icon => (
        <FooterIcon actions={actions} key={icon.href} {...icon} />
      ))}
    </View>
  </View>
);

SideNavFooter.propTypes = {
  actions: PropTypes.object
};

export default SideNavFooter;
