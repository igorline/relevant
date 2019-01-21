import PropTypes from 'prop-types';

export const userProps = PropTypes.shape({
  handle: PropTypes.string.isRequired,
  balance: PropTypes.number,
  image: PropTypes.string,
  name: PropTypes.string.isRequired,
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
  type: PropTypes.string,
});

export const authProps = PropTypes.shape({
  isAuthenticated: PropTypes.bool.isRequired,
  user: userProps,
  community: PropTypes.string
});
