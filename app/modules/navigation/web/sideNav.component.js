import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import NavProfile from 'modules/profile/navProfile.component';
import Community from 'modules/community/communityNav.component';
import SideNavFooter from 'modules/navigation/web/sideNavFooter.component';
import { colors, layout, sizing } from 'app/styles';

const SideNavContent = styled.div`
  background: ${colors.secondaryBG};
  width: ${layout.sideNavWidth};
  max-width: ${layout.sideNavWidth};
  display: flex;
  flex-direction: column;
  z-index: 10;
  ${layout.universalBorder('right')}
`;

const SideNavScroll = styled.div`
  padding-top: ${layout.headerHeight};
  height: 100vh;
  overflow: scroll;
  position: fixed;
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
  z-index: 100;
  position: fixed;
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

const SideNav = (props) => {
  const logoLink = props.isAuthenticated ? '/relevant/new' : '/';
  return (
    <SideNavContent className={props.className}>
      <SideNavScroll>
        <LogoContainer>
          <StyledLink to={logoLink}>
            <StyledImg src={'/img/logo.svg'} alt={'Relevant'} />
          </StyledLink>
        </LogoContainer>
        <SideNavSection>
          <NavProfile />
        </SideNavSection>
        <SideNavSection>
          <Community />
        </SideNavSection>
        <SideNavFooter />
      </SideNavScroll>
    </SideNavContent>
  );
};


SideNav.propTypes = {
  className: PropTypes.string,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
});


export default connect(
  mapStateToProps,
)(SideNav);
