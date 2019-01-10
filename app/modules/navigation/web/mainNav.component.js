import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import styled from 'styled-components';
import ContentHeader from 'modules/navigation/web/contentHeader.component';
import SideNav from 'modules/navigation/web/sideNav.component';
import { colors, layout } from 'app/styles/globalStyles';

const ContentContainer = styled.section`
  max-width: 100vw;
  display: flex;
  position: relative;
  background: white;
`;

const StyledSideNav = styled(SideNav)`
  width: 300px;
  display: inline-block;
  z-index: 10;
  border-right: ${layout.borderStyles(colors.borderColor)};
`;

const MainContent = styled.section`
  flex: 1;
`;

const MainNav = (props) => {
  return (
    <ContentContainer>
      <StyledSideNav>Hello</StyledSideNav>
      <MainContent>
        <ContentHeader />
        {renderRoutes(props.route.routes)}
      </MainContent>
    </ContentContainer>
  );
};


MainNav.propTypes = {
  route: PropTypes.object,
};

export default MainNav;
