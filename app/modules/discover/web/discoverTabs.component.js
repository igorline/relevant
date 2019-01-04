import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { tabStyles } from 'modules/navigation/web/tabStyles';
import { standardRoutes } from './discoverHelper';

const StyledNavLink = styled(NavLink)`
  ${tabStyles}
  margin-right: 1em;
`;

const DiscoverTab = (props) => {
  const { linkData, community, tag } = props;
  let url = `/${community}/${linkData.key}`;
  if (tag) {
    url += `/${tag}`;
  }

  return <StyledNavLink to={url}>{linkData.title}</StyledNavLink>;
};

DiscoverTab.propTypes = {
  linkData: PropTypes.object,
  community: PropTypes.string,
  tag: PropTypes.string,
};


const StyledUl = styled.ul`
  margin: 0;
  padding: 0;
`;

const DiscoverTabs = ({ view, community }) => (
  <StyledUl>
    {standardRoutes.map((linkData, i) => (
      <DiscoverTab key={i} tag={get(view, 'discover.tag')} community={community} tabStyles={tabStyles} linkData={linkData} />
    ))}
  </StyledUl>
);


DiscoverTabs.propTypes = {
  view: PropTypes.object,
  community: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    view: state.view,
    community: state.community.active,
  };
}

export default connect(
  mapStateToProps,
)(DiscoverTabs);
