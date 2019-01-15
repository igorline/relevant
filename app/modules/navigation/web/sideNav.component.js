import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import NavProfile from 'modules/profile/web/navProfile.component';
import Community from 'modules/community/web/communityNav.component';
import SideNavFooter from 'modules/navigation/web/sideNavFooter.component';
import { colors, layout } from 'app/styles/globalStyles';

const SideNavContent = styled.div`
  background: ${colors.sideNavBackground};
  width: ${layout.sideNavWidth};
  max-width: ${layout.sideNavWidth};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 10;
  border-right: ${layout.borderStyles(colors.borderColor)};
  padding-top: ${layout.headerHeight}
`;

const SideNavSection = styled.div`
  border-bottom: ${layout.borderStyles(colors.borderColor)};
`;

const LogoContainer = styled(SideNavSection)`
  height: ${layout.headerHeight};
  /* height: 101px; */
  display: flex;
  padding-left: 2em;
  padding-right: 5em;
  align-items: center;
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  width: ${layout.sideNavWidth};
  background: ${colors.sideNavBackground};
  border-right: ${layout.borderStyles(colors.borderColor)};
`;

const StyledLink = styled(Link)`
  display: flex;
`;

const StyledImg = styled.img`
  max-width: 100%;
`;

const SideNav = (props) => {
  const { className } = props;
  const logoLink = props.isAuthenticated ? '/relevant/new' : '/';
  return (
    <SideNavContent className={className} >
      <LogoContainer>
        <StyledLink to={logoLink}>
          <StyledImg src={'/img/logo.svg'} className={'logo'} alt={'Relevant'} />
        </StyledLink>
      </LogoContainer>
      <SideNavSection>
        <NavProfile />
      </SideNavSection>
      <SideNavSection>
        <Community />
      </SideNavSection>
      <SideNavFooter />
    </SideNavContent>
  );
};


SideNav.propTypes = {
  isAuthenticated: PropTypes.bool,
  className: PropTypes.string,
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
});


export default connect(
  mapStateToProps,
)(SideNav);
