import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import NavProfileComponent from 'modules/profile/navProfile.component';
import CommunityNav from 'modules/community/communityNav.component';
import SideNavFooter from 'modules/navigation/web/sideNavFooter.component';
import { colors, layout, sizing } from 'app/styles';
import { Text } from 'modules/styled/web';
import { showModal } from 'modules/navigation/navigation.actions';

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
  overflow: scroll;
  width: ${layout.sideNavWidth};
`;

const SideNavSection = styled.div`
  ${layout.universalBorder('bottom')}
`;

const LogoContainer = styled(SideNavSection)`
  height: ${layout.headerHeight};
  display: flex;
  padding-left: ${sizing(4)};
  align-items: center;
  z-index: 10;
  top: 0;
  left: 0;
  width: ${layout.sideNavWidth};
  background: ${colors.secondaryBG};
  ${layout.universalBorder('right')}
`;

const StyledLink = styled(Link)`
  display: flex;
`;

const StyledImg = styled.img`
  max-width: 100%;
  height: ${sizing(4)};
`;

const GetStarted = styled(Text)`
  cursor: pointer;
  margin-top: ${sizing(1.8)};
  margin-left: ${sizing(1)};
`;

const SideNav = props => {
  const openHelpModal = props.actions.showModal;
  const logoLink = '/relevant/new';
  return (
    <SideNavContent className={props.className}>
      <SideNavScroll>
        <LogoContainer>
          <StyledLink to={logoLink}>
            <StyledImg src={'/img/logo.svg'} alt={'Relevant'} />
            <GetStarted onClick={() => openHelpModal('onboarding')}>
              <img src={'/img/info.svg'} />
            </GetStarted>
          </StyledLink>
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
