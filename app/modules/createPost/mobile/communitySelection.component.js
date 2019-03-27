import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { View } from 'modules/styled/uni';
import { colors } from 'app/styles';
import CommunityListItem from 'modules/community/communityListItem.component';

class CommunitySelection extends Component {
  static propTypes = {
    actions: PropTypes.object,
    community: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      input: '',
      inputFocused: false
    };
  }

  setCommunity(community) {
    this.props.actions.setCommunity(community.slug);
  }

  render() {
    const { community } = this.props;
    const { communities } = community;
    if (!communities) {
      return null;
    }
    if (!Object.values(communities)) {
      return null;
    }
    return (
      <View pt={3} style={{ flexDirection: 'column' }}>
        {Object.values(communities).map(c => (
          <TouchableOpacity
            onPress={() => requestAnimationFrame(() => this.setCommunity(c))}
            key={c.slug}
          >
            <CommunityListItem
              p="1 2"
              community={c}
              bg={community.active === c.slug ? colors.blue : null}
              c={community.active === c.slug ? `${colors.white}` : null}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

export default CommunitySelection;
