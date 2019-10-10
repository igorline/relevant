import React from 'react';
import PropTypes from 'prop-types';
import { View, Title, BodyText } from 'modules/styled/uni';
import { useDispatch } from 'react-redux';
import ToggleSwitch from 'modules/ui/toggleswitch.component';
import { colors } from 'app/styles';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
import { SETTING_DETAILS } from './settings.constants';

NotificationToggle.propTypes = {
  parent: PropTypes.string,
  label: PropTypes.string,
  notification: PropTypes.bool,
  togglePosition: PropTypes.string,
  text: PropTypes.shape({
    label: PropTypes.string,
    description: PropTypes.description
  }),
  DescriptionComponent: PropTypes.object
};

export function NotificationToggle({
  parent,
  label,
  notification,
  text,
  togglePosition,
  DescriptionComponent
}) {
  const dispatch = useDispatch();
  const details = text || SETTING_DETAILS[parent][label];
  const reverse = togglePosition === 'right';
  if (!details) return null;
  const Description = DescriptionComponent || BodyText;
  return (
    <View mt={3} fdirection={`row${reverse ? '-reverse' : ''}`} align="center">
      <ToggleSwitch
        isOn={!!notification}
        onColor={colors.green}
        offColor={colors.grey}
        size="custom"
        onToggle={isOn =>
          dispatch(updateNotificationSettings({ [parent]: { [label]: isOn } }))
        }
      />
      <View fdirection="column" ml={reverse ? 0 : 2} mr={reverse ? 1.5 : 0} flex={1}>
        {details.label ? <Title>{details.label}</Title> : null}
        {details.description ? <Description>{details.description}</Description> : null}
      </View>
    </View>
  );
}
