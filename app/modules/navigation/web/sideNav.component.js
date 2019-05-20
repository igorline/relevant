import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showModal, closeWebSideNav } from 'modules/navigation/navigation.actions';
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
  top: ${p => (p.top ? p.top : 0)};
`;

const SideNavContent = styled.div`
  background: ${colors.secondaryBG};
  width: ${layout.sideNavWidth};
  max-width: ${layout.sideNavWidth};
  ${layout.universalBorder('right')}
  display: flex;
  z-index: 100;
  height: calc(100vh - ${p => (p.top ? p.top : '0px')});
  top: 0;
`;

const SideNavScroll = styled.div`
  flex-direction: column;
  display: block;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  width: ${layout.sideNavWidth};
`;

const LogoContainer = styled(View)`
  position: ${p => (p.screenSize ? 'relative' : 'sticky')};
  background: ${colors.secondaryBG};
  height: ${layout.headerHeight};
  top: 0;
  z-index: 10;
  flex: 1;
  ${mixins.border}
`;

class SideNav extends Component {
  componentDidMount() {
    this.props.history.listen(() => {
      this.props.actions.closeWebSideNav();
    });
  }

  render() {
    const { community, className, actions, notif, navigation } = this.props;
    const logoLink = `/${community || 'relevant'}/new`;
    return (
      <Container top={notif.promptType ? layout.BANNER_PROMPT_HEIGHT : null}>
        <SideNavContent
          flex={1}
          className={className}
          top={notif.promptType ? layout.BANNER_PROMPT_HEIGHT : null}
        >
          <SideNavScroll flex={1}>
            <LogoContainer
              bb
              h={layout.headerHeight}
              align="center"
              fdirection="row"
              justify="space-between"
              p={['0 4', '0 2']}
              screenSize={navigation.screenSize}
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
              <CommunityNav
                {...this.props}
                viewCommunityMembers={() => {
                  actions.showModal('communityMembers');
                }}
                showSettings={() => {
                  actions.showModal('communitySettings');
                }}
              />
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
  history: PropTypes.object,
  notif: PropTypes.object
};

const mapStateToProps = state => ({
  community: state.auth.community,
  isAuthenticated: state.auth.isAuthenticated,
  navigation: state.navigation,
  notif: state.notif
});

export default withRouter(
  connect(
    mapStateToProps,
    dispatch => ({
      actions: bindActionCreators(
        {
          showModal,
          closeWebSideNav
        },
        dispatch
      )
    })
  )(SideNav)
);
