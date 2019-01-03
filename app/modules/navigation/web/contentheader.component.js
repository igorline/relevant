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


// This could be react-router-dom's Link for example
const CustomLink = ({ className, children }) => (
  <a className={className}>
    {children}
  </a>
);

const Nav = styled.nav`
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
  return (
    <Nav>
      <SubNav>
        <NavLink to="/relevant/new"><NavItem>New</NavItem></NavLink>
        <NavLink to="/relevant/top"><NavItem>Trending</NavItem></NavLink>
      </SubNav>
      <SubNav>
        <NavLink to="/new"><NavItem>Activity</NavItem></NavLink>
        <NavLink to="/trending"><NavItem>New Post</NavItem></NavLink>
      </SubNav>
    </Nav>
  );
};

export default ContentHeader;
