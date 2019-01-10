import React from 'react';
import PropTypes from 'prop-types';
import { Touchable } from 'react-primitives';
import { Link } from 'react-router-dom';

let environment = 'web';
if (process.env.WEB !== 'true') {
  environment = 'native';
}

export default function ULink(props) {
  // const StyledLink = styled(Link)`${props.styles}`
  if (environment === 'web') {
    return <Link style={props.style} onClick={props.onClick, props.mobileStyles} to={props.to}>{props.children}</Link>;
  }
  // const StyledTouchable = styled.Touchable`${{...props.styles, props.webStyles}}`;
  return (
    <Touchable style={props.style} onPress={props.onPress}>
      {props.children}
    </Touchable>
  );
}

ULink.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  onPress: PropTypes.func,
  onClick: PropTypes.func,
  style: PropTypes.object,
};
