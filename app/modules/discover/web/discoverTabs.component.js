import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import { greyText, darkGrey } from 'app/styles/colors';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { standardRoutes } from './discoverHelper';

const activeStyle = {
  color: darkGrey,
  fontWeight: 'bold',
};

// const linkStyle = {
//   color: `hsl(0, 0%, 80%)`,
//   margin: '1em 0',
// };

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

DiscoverTab.propTypes = {
  linkData: PropTypes.object,
  community: PropTypes.string,
  sort: PropTypes.string,
  tag: PropTypes.string,
};

const CustomLi = ({ className, children }) => (
  <li className={className}>
    {children}
  </li>
);


const StyledLi = styled(CustomLi)`
  margin: 1em 0;
  color: green;
  font-weight: bold;
  a {
    margin: 1em 0,
    color: hsl(0, 0%, 50%);
    :hover {
      color: ${darkGrey};
    }
  }
`;

const DiscoverTabs = (props) => (
  <ul className="tabs">
    {standardRoutes.map((linkData) => (
      <StyledLi key={linkData.key}>
        <DiscoverTab {...get(props, 'view.discover')} linkData={linkData} />
      </StyledLi>
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
