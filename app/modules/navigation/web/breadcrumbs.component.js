import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import { colors } from 'app/styles';
import { StyledNavLink, View } from 'modules/styled/web';

class Breakcrumbs extends Component {
  static propTypes = {
    view: PropTypes.object,
    auth: PropTypes.object,
    community: PropTypes.object
  };

  render() {
    const { view, auth, community } = this.props;
    const communitySlug = get(view, 'discover.community') || get(auth, 'community');
    if (!communitySlug) {
      return null;
    }
    const activeCommunity = get(community, `communities.${communitySlug}`);
    const sort = get(view, 'discover.sort') || 'new';
    return (
      <View>
        {activeCommunity ? (
          <StyledNavLink
            lh={1.5}
            fs={1.5}
            c={colors.black}
            to={`/${communitySlug}/${sort}`}
          >
            Community: {activeCommunity.name}{' '}
          </StyledNavLink>
        ) : null}
        {get(view, 'discover.tag') ? (
          <View fdirection="row">
            <StyledNavLink
              lh={1.5}
              fs={1.5}
              c={colors.black}
              to={`/${communitySlug}/${sort}/${view.discover.tag}`}
            >
              &nbsp;→ #{view.discover.tag}
            </StyledNavLink>
          </View>
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  view: state.view,
  auth: state.auth,
  community: state.community
});

const mapDispatchToProps = () => ({
  // actions: bindActionCreators({ ...authActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Breakcrumbs);
