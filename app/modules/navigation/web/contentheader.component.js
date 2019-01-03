import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import Avatar from 'modules/user/web/avatar.component';
import ShadowButton from 'modules/ui/web/ShadowButton';
import * as authActions from 'modules/auth/auth.actions';
import * as notifActions from 'modules/activity/activity.actions';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import Activity from 'modules/activity/web/activity.container';
import RequestInvite from 'modules/web_splash/requestInvite.component';
import { matchPath } from 'react-router';
import styled from 'styled-components';


const Nav = styled.section`
  width: 100%;
  background: white;
  display: flex;
  justify-content: space-between;
`;

const SubNav = styled.div`
  display: inline-block;
  margin: 1em;
`;

const NavItem = styled('span')`
  color: blue;
  margin: 0 1em;
`;

const ContentHeader = (props) => {
  const { match, location } = props;
  console.log('props', props)
  return (
    <Nav>
      <SubNav>
        <DiscoverTabs
          match={match || { params: {} } }
          location={location}
          auth={{}}
        />
        <NavLink to="/relevant/new">New</NavLink>
        <NavLink to="/relevant/top">Trending</NavLink>
      </SubNav>
      <SubNav>
        <NavLink to="/">Activity</NavLink>
        <NavLink to="/">New Post</NavLink>
      </SubNav>
    </Nav>
  );
};

ContentHeader.propTypes = {
  match: PropTypes.object,
  location: PropTypes.object,
};

export default ContentHeader;
