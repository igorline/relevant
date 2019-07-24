import React from 'react';
import PropTypes from 'prop-types';
import { View, BodyText, InlineText } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import SocialIcons from 'modules/navigation/social.icons';
import { colors } from 'styles';

const SideNavFooter = ({ actions }) => (
  <View m={[4, 2]}>
    <SocialIcons actions={actions} />
    <BodyText inline={1} mt={3}>
      <ULink to="/info/faq">
        <InlineText c={colors.blue}>FAQ</InlineText>
      </ULink>
      <InlineText> | </InlineText>
      <ULink to="/eula.html" external target="_blank">
        <InlineText c={colors.blue}>Content Policy</InlineText>
      </ULink>
      <InlineText> | </InlineText>
      <ULink external to="/privacy.html" target="_blank">
        <InlineText c={colors.blue}>Privacy Policy</InlineText>
      </ULink>
    </BodyText>
    <BodyText mt={2}>© 2019 Relevant Protocols Inc.</BodyText>
  </View>
);

SideNavFooter.propTypes = {
  actions: PropTypes.object
};

export default SideNavFooter;
