import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { SmallText } from 'modules/styled/uni';

class Tag extends Component {
  static propTypes = {
    name: PropTypes.string,
    community: PropTypes.string,
    noLink: PropTypes.bool,
    actions: PropTypes.object
  };

  render() {
    const { community, name, noLink, actions, ...rest } = this.props;
    const link = encodeURI(`/${community}/top/${name}`);
    return (
      <ULink
        hu
        type="text"
        to={link}
        onClick={e => e.stopPropagation()}
        onPress={() => actions.goToTopic(name)}
        noLink={noLink}
        inline={1}
      >
        <SmallText inline={1} {...rest}>
          {'#'}
          {this.props.name}{' '}
        </SmallText>
      </ULink>
    );
  }
}

export default Tag;
