import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Avatar from 'modules/user/web/avatar.component';
import ShadowButton from 'modules/ui/web/ShadowButton';
import * as authActions from 'modules/auth/auth.actions';
import * as notifActions from 'modules/activity/activity.actions';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import Activity from 'modules/activity/web/activity.container';
import RequestInvite from 'modules/web_splash/requestInvite.component';
import { matchPath } from 'react-router';
import styled from 'styled-components';


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

const NavItem = styled.a`
  color: blue;
  margin: 0 1em;
`;


const ContentHeader = (props) => {
  return (
    <Nav>
      <SubNav>
        <NavItem href="/new">New</NavItem>
        <NavItem href="/trending">Trending</NavItem>
      </SubNav>
      <SubNav>
        <NavItem href="/new">Activity</NavItem>
        <NavItem href="/trending">New Post</NavItem>
      </SubNav>
    </Nav>
  );
};

export default ContentHeader;
