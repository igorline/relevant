import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { openWebSideNav, closeWebSideNav } from 'modules/navigation/navigation.actions';
import { colors, sizing } from 'app/styles';

const Menu = styled.div`
  z-index: 100;
  cursor: pointer;
  width: 35px;
  @media screen and (min-width: 736px) * {
    display: none;
  }
  margin-right: ${sizing(4)}
  :hover * {
    background-color: ${colors.black};
  }
`;

const MenuBar = styled.div`
  width: 100%;
  height: 5px;
  background-color: ${colors.grey};
  margin: 5px 0;
`;

class MenuIcon extends Component {
  toggleMenu = () => {
    const { actions, sideNavIsOpen } = this.props;
    if (sideNavIsOpen) {
      actions.closeWebSideNav();
    }
    if (!sideNavIsOpen) {
      actions.openWebSideNav();
    }
  };
  render() {
    return (
      <Menu onClick={this.toggleMenu}>
        <MenuBar />
        <MenuBar />
        <MenuBar />
      </Menu>
    );
  }
}

MenuIcon.propTypes = {
  sideNavIsOpen: PropTypes.bool,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  sideNavIsOpen: state.navigation.sideNavIsOpen
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      openWebSideNav,
      closeWebSideNav
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuIcon);
