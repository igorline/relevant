import React from 'react';
import PropTypes from 'prop-types';
import { View, BodyText, InlineText } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import SocialIcons from 'modules/navigation/social.icons';

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
    <SocialIcons actions={actions} />
  </View>
);

SideNavFooter.propTypes = {
  actions: PropTypes.object
};

export default SideNavFooter;
