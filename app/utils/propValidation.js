import PropTypes from 'prop-types';
import { isValidElementType } from 'react-is';

export const userProps = PropTypes.shape({
  handle: PropTypes.string,
  balance: PropTypes.number,
  image: PropTypes.string,
  name: PropTypes.string
  // relevance: // TODO shape or null
});

export const postProps = PropTypes.shape({
  _id: PropTypes.string.isRequired, // TODO
  user: PropTypes.string.isRequired,
  title: PropTypes.string,
  embeddedUser: PropTypes.object, // userProp?
  tags: PropTypes.array,
  body: PropTypes.string,
  postDate: PropTypes.instanceOf(Date),
  data: PropTypes.object, // TODO shape or null
  link: PropTypes.object, // TODO shape or null
  parentPost: PropTypes.number,
  type: PropTypes.string
});

export const authProps = PropTypes.shape({
  isAuthenticated: PropTypes.bool,
  user: userProps,
  community: PropTypes.string
});

// eslint-disable-next-line consistent-return
export function elementTypePropTypeChecker(props, propName, componentName) {
  if (props[propName] && !isValidElementType(props[propName])) {
    return new Error(
      `Invalid prop '${propName}' supplied to '${componentName}': the prop is not a valid React component`
    );
  }
}
