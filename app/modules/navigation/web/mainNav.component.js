import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import styled from 'styled-components';
import ContentHeader from 'modules/navigation/web/contentheader.component';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { layout } from 'app/styles';
import { View } from 'modules/styled/uni';

const ContentContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: white;
`;

const StyledSideNav = styled(SideNav)`
  ${layout.universalBorder('right')}
`;

const MainNav = props => (
  <ContentContainer>
    <StyledSideNav {...props} />
    <View flex={1} pt={layout.headerHeight}>
      <ContentHeader />
      {renderRoutes(props.route.routes)}
    </View>
  </ContentContainer>
);


MainNav.propTypes = {
  route: PropTypes.object,
};

export default withRouter(MainNav);
