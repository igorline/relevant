import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import styled from 'styled-components';
import ContentHeader from 'modules/navigation/web/contentheader.component';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { layout } from 'app/styles';

const ContentContainer = styled.div`
  max-width: 100vw;
  display: flex;
  position: relative;
  background: white;
`;

const StyledSideNav = styled(SideNav)`
  display: inline-block;
  z-index: 100;
  ${layout.universalBorder('right')}
`;

const MainContent = styled.div`
  flex: 1;
  position: relative;
  padding-top: ${layout.headerHeight}
`;


const MainNav = props => (
  <ContentContainer>
    <StyledSideNav {...props} />
    <MainContent>
      <ContentHeader />
      {renderRoutes(props.route.routes)}
    </MainContent>
  </ContentContainer>
);


MainNav.propTypes = {
  route: PropTypes.object,
};

export default withRouter(MainNav);
