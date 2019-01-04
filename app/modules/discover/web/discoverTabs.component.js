import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import { greyText, darkGrey } from 'app/styles/colors';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { standardRoutes } from './discoverHelper';

const StyledNavLink = styled(NavLink)`
  margin: 1em 1em 1em 0;
  color: hsl(0, 0%, 80%);
  font-weight: bold;
  &.${'active'} {
    color: black;
    fontWeight: 'bold'
  }
`;

const DiscoverTab = (props) => {
  const { linkData, community, tag, sort } = props;
  // const isActive = () => linkData.key === sort;

  let url = `/${community}/${linkData.key}`;
  if (tag) {
    url += `/${tag}`;
  }
  return <StyledNavLink to={url}>{linkData.title}</StyledNavLink>;
};

DiscoverTab.propTypes = {
  linkData: PropTypes.object,
  community: PropTypes.string,
  sort: PropTypes.string,
  tag: PropTypes.string,
};


const DiscoverTabs = (props) => (
  <ul>
    {standardRoutes.map((linkData, i) => (
      <DiscoverTab key={i} {...get(props, 'view.discover')} linkData={linkData} />
    ))}
  </ul>
);


DiscoverTabs.propTypes = {
  view: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    view: state.view,
  };
}

export default connect(
  mapStateToProps,
)(DiscoverTabs);
