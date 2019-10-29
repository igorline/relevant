import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { colors } from 'app/styles';
import { StyledNavLink } from 'modules/styled/web';
import { View } from 'modules/styled/uni';
import { refreshTab } from 'modules/navigation/navigation.actions';

class Breadcrumbs extends Component {
  static propTypes = {
    view: PropTypes.object,
    auth: PropTypes.object,
    community: PropTypes.object,
    newPosts: PropTypes.object,
    actions: PropTypes.object
  };

  render() {
    const { view, auth, community, newPosts, actions } = this.props;
    const communitySlug = get(view, 'discover.community') || get(auth, 'community');
    if (!communitySlug) {
      return null;
    }
    const activeCommunity = get(community, `communities.${communitySlug}`);
    const sort = get(view, 'discover.sort') || 'new';

    const newPostsNumber = newPosts[auth.community];
    const refreshPostsEl = (
      <StyledNavLink
        to="#"
        onClick={() => actions.refreshTab('discover')}
        ml={1}
        c={colors.blue}
        hu
        lh={1.5}
        fs={1.5}
      >
        See New Posts
      </StyledNavLink>
    );

    return (
      <View fdirection={'row'} align={'flex-start'}>
        {activeCommunity ? (
          <StyledNavLink
            lh={1.5}
            fs={1.5}
            c={colors.black}
            to={encodeURI(`/${communitySlug}/${sort}`)}
          >
            Community: {activeCommunity.name}{' '}
          </StyledNavLink>
        ) : null}
        {get(view, 'discover.tag') ? (
          <StyledNavLink
            lh={1.5}
            fs={1.5}
            c={colors.black}
            to={encodeURI(`/${communitySlug}/${sort}/${view.discover.tag}`)}
          >
            &nbsp;→ #{view.discover.tag}
          </StyledNavLink>
        ) : null}

        {newPostsNumber ? refreshPostsEl : null}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  newPosts: state.posts.newPostsAvailable,
  view: state.view,
  auth: state.auth,
  community: state.community
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ refreshTab }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Breadcrumbs);
