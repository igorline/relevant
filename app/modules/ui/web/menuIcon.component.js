import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View } from 'modules/styled/web';
import styled from 'styled-components';
import { openWebSideNav, closeWebSideNav } from 'modules/navigation/navigation.actions';
import { colors, sizing } from 'app/styles';

const Menu = styled(View)`
  display: flex;
  cursor: pointer;
  width: ${sizing(3)};
  :hover * {
    background-color: ${colors.black};
  }
`;

const MenuBar = styled(View)`
  width: 100%;
  height: 3px;
  background-color: ${colors.grey};
  margin: 0.2rem 0;
`;

class MenuIcon extends Component {
  toggleMenu = () => {
    const {
      actions,
      navigation: { sideNavIsOpen }
    } = this.props;
    if (sideNavIsOpen) {
      actions.closeWebSideNav();
    }
    if (!sideNavIsOpen) {
      actions.openWebSideNav();
    }
  };

  render() {
    const {
      mr,
      ml,
      navigation: { screenSize }
    } = this.props;
    if (!screenSize) return null;

    return (
      <View mr={mr} ml={ml}>
        <Menu onClick={this.toggleMenu} fdirection="column" justify="space-between">
          <MenuBar />
          <MenuBar />
          <MenuBar />
        </Menu>
      </View>
    );
  }
}

MenuIcon.propTypes = {
  actions: PropTypes.object,
  navigation: PropTypes.object,
  ml: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  mr: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])
};

const mapStateToProps = state => ({
  navigation: state.navigation
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
