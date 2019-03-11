import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  showModal,
  openWebSideNav,
  closeWebSideNav
} from 'modules/navigation/navigation.actions';
import styled from 'styled-components';
import NavProfileComponent from 'modules/profile/navProfile.component';
import CommunityNav from 'modules/community/communityNav.component';
import SideNavFooter from 'modules/navigation/sideNavFooter.component';
import { colors, layout, mixins } from 'app/styles';
import { withRouter } from 'react-router-dom';
import ULink from 'modules/navigation/ULink.component';
import { Image, View } from 'modules/styled/web';
import MenuIcon from 'modules/ui/web/menuIcon.component';

const Container = styled.div`
  position: sticky;
  z-index: 100;
  top: 0;
`;

const SideNavContent = styled.div`
  background: ${colors.secondaryBG};
  width: ${layout.sideNavWidth};
  max-width: ${layout.sideNavWidth};
  ${layout.universalBorder('right')}
  display: flex;
  z-index: 100;
  height: 100vh;
  top: 0;
`;

const SideNavScroll = styled.div`
  flex-direction: column;
  display: block;
  overflow: scroll;
  flex: 1;
  width: ${layout.sideNavWidth};
`;

const LogoContainer = styled(View)`
  background: ${colors.secondaryBG};
  height: ${layout.headerHeight};
  top: 0;
  z-index: 10;
  flex: 1;
  ${mixins.border}
`;

class SideNav extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.props.actions.closeWebSideNav();
    }
  }
  render() {
    const { community, className } = this.props;
    const logoLink = `/${community || 'relevant'}/new`;
    return (
      <Container>
        <SideNavContent flex={1} className={className}>
          <SideNavScroll flex={1}>
            <LogoContainer
              bb
              h={layout.headerHeight}
              align="center"
              fdirection="row"
              justify="space-between"
              pl={4}
              pr={4}
            >
              <ULink align={'flex-start'} to={logoLink}>
                <Image
                  h={4}
                  w={22}
                  resizeMode={'contain'}
                  src={'/img/logo-opt.png'}
                  alt={'Relevant'}
                />
              </ULink>
              <MenuIcon />
            </LogoContainer>
            <View flex={1}>
              <NavProfileComponent />
            </View>
            <View flex={1}>
              <CommunityNav {...this.props} />
            </View>
            <SideNavFooter />
          </SideNavScroll>
        </SideNavContent>
      </Container>
    );
  }
}

SideNav.propTypes = {
  className: PropTypes.string,
  actions: PropTypes.object,
  community: PropTypes.string,
  navigation: PropTypes.object,
  location: PropTypes.object
};

const mapStateToProps = state => ({
  community: state.auth.community,
  isAuthenticated: state.auth.isAuthenticated,
  navigation: state.navigation
});

export default withRouter(
  connect(
    mapStateToProps,
    dispatch => ({
      actions: bindActionCreators(
        {
          showModal,
          openWebSideNav,
          closeWebSideNav
        },
        dispatch
      )
    })
  )(SideNav)
);
