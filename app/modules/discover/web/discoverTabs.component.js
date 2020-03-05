import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { StyledNavLink } from 'modules/styled/web';
import { standardRoutes } from './discoverHelper';

const DiscoverTab = props => {
  const { linkData, community, tag } = props;
  let url = community ? `/${community}/${linkData.key}` : '/communities';
  if (tag) url += `/${tag}`;

  return (
    <StyledNavLink to={encodeURI(url)} mr={[2, 1]}>
      {linkData.title}
    </StyledNavLink>
  );
};

DiscoverTab.propTypes = {
  linkData: PropTypes.object,
  community: PropTypes.string,
  tag: PropTypes.string
};

const StyledUl = styled.ul`
  margin: 0;
  padding: 0;
`;

const DiscoverTabs = ({ view, community }) => (
  <StyledUl>
    {standardRoutes.map((linkData, i) => (
      <DiscoverTab
        key={i}
        tag={get(view, 'discover.tag')}
        community={community}
        linkData={linkData}
      />
    ))}
  </StyledUl>
);

DiscoverTabs.propTypes = {
  view: PropTypes.object,
  community: PropTypes.string
};

function mapStateToProps(state) {
  return {
    view: state.view,
    community: state.auth.community
  };
}

export default connect(mapStateToProps)(DiscoverTabs);
