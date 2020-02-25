import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { View, BodyText, InlineText } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import SocialIcons from 'modules/navigation/social.icons';
import { colors } from 'styles';
import { SIDE_NAV_PADDING } from 'styles/layout';

const SideNavFooter = ({ actions }) => (
  <View m={[SIDE_NAV_PADDING, 2]} mb={8}>
    <SocialIcons actions={actions} />
    <View fdirection={'row'} mt={3}>
      <ULink inline={1} to="/info/faq">
        <BodyText c={colors.blue}>FAQ</BodyText>
      </ULink>
      <InlineText> | </InlineText>
      <ULink inline={1} to="/eula.html" external target="_blank">
        <BodyText c={colors.blue}>Content Policy</BodyText>
      </ULink>
      <InlineText> | </InlineText>
      <ULink inline={1} external to="/privacy.html" target="_blank">
        <BodyText c={colors.blue}>Privacy Policy</BodyText>
      </ULink>
    </View>
    <BodyText mt={2}>© 2019 Relevant Protocols Inc.</BodyText>
  </View>
);

SideNavFooter.propTypes = {
  actions: PropTypes.object
};

export default memo(SideNavFooter);
