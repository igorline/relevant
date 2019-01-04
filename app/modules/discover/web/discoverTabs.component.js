import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { standardRoutes } from './discoverHelper';
import styled from 'styled-components';

const activeStyle = {
  color: 'red',
  fontWeight: 'bold',
};

const DiscoverTab = (props) => {
  const { linkData, community, sort, tag } = props;
  const isActive = () => linkData.key === sort;
  let url = `/${community}/${linkData.key}`;
  if (tag) {
    url += `/${tag}`;
  }
  return (
    <NavLink
      to={url}
      activeStyle={activeStyle}
      isActive={isActive}
    >
      {linkData.title}
    </NavLink>);
};

const StyledUl = styled.ul`
  margin: 1em;
`;

const DiscoverTabs = (props) => (
  <StyledUl className="tabs">
    {standardRoutes.map((linkData) => (
      <li key={linkData.key}>
        <DiscoverTab {...get(props, 'view.discover')} linkData={linkData} />
      </li>
    ))}
  </StyledUl>
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
