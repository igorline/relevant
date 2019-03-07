import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, CommunityLink } from 'modules/styled/uni';
import { colors } from 'app/styles';
import styled from 'styled-components/primitives';

const CommunityImage = styled(Image)`
  background-color: ${p => (p.image ? 'transparent' : colors.grey)};
`;

class CommunityListItem extends Component {
  static propTypes = {
    community: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.string,
    c: PropTypes.string
  };

  render() {
    const { community, className, c, style, ...rest } = this.props;
    const image = community.image
      ? { uri: community.image }
      : require('app/public/img/default_community.png');
    return (
      <View
        align={'center'}
        fdirection={'row'}
        className={className}
        style={style}
        {...rest}
      >
        <CommunityImage w={4} h={4} mr={1.5} source={image} resizeMode={'cover'} />
        <CommunityLink lh={1.75} c={c || colors.black}>
          {community.name}
        </CommunityLink>
      </View>
    );
  }
}

export default CommunityListItem;
