import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import NavProfileComponent from 'modules/profile/navProfile.component';
import CommunityNav from 'modules/community/communityNav.component';
import SideNavFooter from 'modules/navigation/web/sideNavFooter.component';
import { colors, layout, mixins } from 'app/styles';
import { showModal } from 'modules/navigation/navigation.actions';
import ULink from 'modules/navigation/ULink.component';
import { Image, View } from 'modules/styled/web';

const SideNavContent = styled.div`
  position: sticky;
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
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: scroll;
  width: ${layout.sideNavWidth};
`;

const SideNavSection = styled.div`
  ${layout.universalBorder('bottom')}
`;

const LogoContainer = styled.div`
  position: sticky;
  background: ${colors.secondaryBG};
  height: ${layout.headerHeight};
  top: 0;
  z-index: 10;
  ${mixins.border}
`;

const SideNav = props => {
  const logoLink = '/relevant/new';
  return (
    <SideNavContent className={props.className}>
      <SideNavScroll>
        <LogoContainer br bb>
          <ULink align={'flex-start'} to={logoLink}>
            <View pl={4} h={layout.headerHeight} align={'center'} fdirection={'row'}>
              <Image
                h={4}
                w={22}
                resizeMode={'contain'}
                src={require('app/public/img/logo-opt.png')}
                alt={'Relevant'}
              />
            </View>
          </ULink>
        </LogoContainer>
        <SideNavSection>
          <NavProfileComponent />
        </SideNavSection>
        <SideNavSection>
          <CommunityNav {...props} />
        </SideNavSection>
        <SideNavFooter />
      </SideNavScroll>
    </SideNavContent>
  );
};

SideNav.propTypes = {
  className: PropTypes.string,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  dispatch => ({
    actions: bindActionCreators({ showModal }, dispatch)
  })
)(SideNav);
