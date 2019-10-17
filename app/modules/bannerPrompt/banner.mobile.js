import PropTypes from 'prop-types';
import { Alert } from 'app/utils/alert';

const { alert } = Alert();

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
  return alert(
    title || messageText,
    title ? messageText : null,
    [
      {
        text: dismissText || 'Not Now',
        onPress: onDismiss
        // style: 'cancel'
      },
      {
        text: actionText || 'Enable',
        onPress: onClick
      }
    ],
    { cancelable: false }
  );
}
