import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import NavProfile from 'modules/profile/web/navProfile.component';

const borderColor = '#D8D8D8';

const SideNavContent = styled.div`
  background: #FAFBFC;
  width: 300px;
  max-width: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${borderColor};
  border-right: 1px solid ${borderColor};
`;

const SideNavSection = styled.div`
  border-bottom: 1px solid ${borderColor};
`;

const LogoContainer = styled.div`
  height: 101px;
  display: flex;
  padding-left: 2em;
  padding-right: 5em;
  align-items: center;
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
