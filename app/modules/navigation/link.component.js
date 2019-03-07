import React from 'react';
import PropTypes from 'prop-types';
import { Touchable } from 'react-primitives';
import { Link } from 'react-router-dom';

let environment = 'web';
if (process.env.WEB !== 'true') {
  environment = 'native';
}

export default function ULink(props) {
  if (environment === 'web') {
    return (
      <Link onClick={props.onClick} to={props.to}>
        {props.children}
      </Link>
    );
  }
  return <Touchable onPress={props.onPress}>{props.children}</Touchable>;
}

ULink.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  onPress: PropTypes.func,
  onClick: PropTypes.func
};
