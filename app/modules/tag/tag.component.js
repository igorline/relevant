import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { InlineText } from 'modules/styled/uni';

class Tag extends Component {
  static propTypes = {
    name: PropTypes.string,
    community: PropTypes.string,
    noLink: PropTypes.bool
  };

  render() {
    const { community, name, noLink, ...rest } = this.props;
    const link = `/${community}/top/${name}`;
    return (
      <ULink
        hu
        type="text"
        to={link}
        onClick={e => e.stopPropagation()}
        noLink={noLink}
        {...rest}
      >
        <InlineText>
          {'#'}
          {this.props.name}{' '}
        </InlineText>
      </ULink>
    );
  }
}

export default Tag;
