import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import styled from 'styled-components';
import ContentHeader from 'modules/navigation/web/contentHeader.component';

const ContentContainer = styled.section`
  max-width: 100vw;
  display: flex;
  background: blue;
  position: relative;
`;

const SideNav = styled.div`
  display: inline-block;
  width: 300px;
  background: pink;
`;

const MainContent = styled.section`
  flex: 1;
  background: orange;
  /* display: flex; */
  /* flex-flow: column; */
`;

const MainNav = (props) => {
  const test = 'pk';
  return (
    <ContentContainer>
      <SideNav>Hello</SideNav>
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
