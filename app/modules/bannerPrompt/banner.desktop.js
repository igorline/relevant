import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'styles';
import ULink from 'modules/navigation/ULink.component';
import { View, BodyText, Text } from 'modules/styled/uni';

ComponentName.propTypes = {
  messageText: PropTypes.string,
  actionText: PropTypes.string,
  dismissText: PropTypes.string,
  onClick: PropTypes.func,
  onDismiss: PropTypes.func
};

export default function ComponentName({
  messageText,
  actionText,
  dismissText,
  onClick,
  onDismiss
}) {
  return (
    <View fdirection="row" justify="space-between" align="center">
      <BodyText c={colors.black} inline={1}>
        {messageText}
        <ULink to="#">
          <Text inline={1} onClick={onClick}>
            {actionText}
          </Text>
        </ULink>
      </BodyText>
      <ULink onClick={onDismiss} to="#" c={colors.black}>
        {dismissText}
      </ULink>
    </View>
  );
}
