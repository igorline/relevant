import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import styled from 'styled-components';
import ContentHeader from 'modules/navigation/web/contentHeader.component';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { colors, layout } from 'app/styles/globalStyles';

const ContentContainer = styled.section`
  max-width: 100vw;
  display: flex;
  position: relative;
  background: white;
`;

const StyledSideNav = styled(SideNav)`
  display: inline-block;
  z-index: 10;
  border-right: ${layout.borderStyles(colors.borderColor)};
`;

const MainContent = styled.section`
  flex: 1;
  position: relative;
  padding-top: ${layout.headerHeight}
`;

const StyledContentHeader = styled(ContentHeader)`
  position: fixed;
  top: 0;
  z-index: 100;
  width: calc(100vw - ${layout.sideNavWidth});
  left: ${layout.sideNavWidth};
`;


const MainNav = (props) => (
  <ContentContainer>
    <StyledSideNav {...props} />
    <MainContent>
      <StyledContentHeader />
      {renderRoutes(props.route.routes)}
    </MainContent>
  </ContentContainer>
);


MainNav.propTypes = {
  route: PropTypes.object,
};

export default withRouter(MainNav);
