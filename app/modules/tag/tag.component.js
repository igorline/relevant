import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { SmallText } from 'modules/styled/uni';
import { goToTopic } from 'modules/navigation/navigation.actions';

Tag.propTypes = {
  name: PropTypes.string,
  community: PropTypes.string,
  noLink: PropTypes.bool
};

export default function Tag({ community, name, noLink, ...rest }) {
  const filter = useSelector(state => state.navigation.discover.sort);
  const link = encodeURI(`/${community}/${filter || 'new'}/${name}`);
  const dispatch = useDispatch();
  return (
    <ULink
      hu
      type="text"
      to={link}
      onClick={e => e.stopPropagation()}
      onPress={() => dispatch(goToTopic(name))}
      noLink={noLink}
      inline={1}
    >
      <SmallText inline={1} {...rest}>
        {'#'}
        {name}{' '}
      </SmallText>
    </ULink>
  );
}
