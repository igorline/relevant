import React from 'react';
import PropTypes from 'prop-types';
import { View, Image } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

const TwitterIcon = require('app/public/img/twitter-black.png');
const EmailIcon = require('app/public/img/email.png');
const SlackIcon = require('app/public/img/slack.png');
const MediumIcon = require('app/public/img/medium.png');
const InstaIcon = require('app/public/img/instagram.png');

const icons = [
  {
    href: 'https://blog.relevant.community',
    source: MediumIcon,
    target: '_blank'
  },
  {
    href: 'https://instagram.com/relevant_community',
    source: InstaIcon,
    target: '_blank'
  },
  {
    href: 'https://twitter.com/relevantfeed',
    source: TwitterIcon,
    target: '_blank'
  },
  {
    href:
      'https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLWVjODViM2ZkZDE5ZWMyYzcxMzI3ZTQ3Njc4YTBmYmVmMTQxZGJiNDcxYzljODZlM2U0NGU1YTE3MDlhM2I1NmI',
    source: SlackIcon,
    target: '_blank'
  },
  {
    href: 'mailto:info@relevant.community',
    source: EmailIcon,
    target: '_blank'
  }
];

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
      inline={1}
    >
      <Image w={2.8} h={2.4} mr={2} resizeMode={'contain'} source={source} />
    </ULink>
  );
};

FooterIcon.propTypes = {
  href: PropTypes.string,
  source: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
  target: PropTypes.string,
  actions: PropTypes.object
};

export default function FooterIcons({ actions }) {
  return (
    <View flex={1} fdirection={'row'} mt={2} mb={[2, 0]}>
      {icons.map(icon => (
        <FooterIcon actions={actions} key={icon.href} {...icon} />
      ))}
    </View>
  );
}

FooterIcons.propTypes = {
  actions: PropTypes.object
};
