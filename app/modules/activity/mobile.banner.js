import PropTypes from 'prop-types';
import { Alert } from 'app/utils/alert';

MobileAlert.propTypes = {
  messageText: PropTypes.string,
  actionText: PropTypes.string,
  dismissText: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  onDismiss: PropTypes.func
};

export default function MobileAlert({
  messageText,
  actionText,
  dismissText,
  onDismiss,
  onClick,
  title
}) {
  return Alert(true).alert(
    title || messageText,
    title ? messageText : null,
    [
      {
        text: actionText || 'Ok',
        onPress: onClick
      },
      {
        text: dismissText || 'Not now',
        onPress: onDismiss,
        style: 'cancel'
      }
    ],
    { cancelable: false }
  );
}
