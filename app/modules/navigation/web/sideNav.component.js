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
  background: #FAFBFC;
  width: ${layout.sideNavWidth};
  max-width: ${layout.sideNavWidth};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 10;
  border-right: ${layout.borderStyles(colors.borderColor)};
`;

const SideNavSection = styled.div`
  border-bottom: ${layout.borderStyles(colors.borderColor)};
`;

const LogoContainer = styled.div`
  height: ${layout.headerHeight};
  /* height: 101px; */
  display: flex;
  padding-left: 2em;
  padding-right: 5em;
  align-items: center;
  z-index: 10;
`;

const StyledLink = styled(Link)`
  display: flex;
`;

const StyledImg = styled.img`
  max-width: 100%;
`;

const SideNav = (props) => {
  const logoLink = props.isAuthenticated ? '/relevant/new' : '/';
  return (
    <SideNavContent>
      <SideNavSection>
        <LogoContainer>
          <StyledLink to={logoLink}>
            <StyledImg src={'/img/logo.svg'} className={'logo'} alt={'Relevant'} />
          </StyledLink>
        </LogoContainer>
      </SideNavSection>
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
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
});


export default connect(
  mapStateToProps,
)(SideNav);
