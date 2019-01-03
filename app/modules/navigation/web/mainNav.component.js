import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import styled from 'styled-components';

const ContentContainer = styled.section`
  width: 100vw;
  display: flex;
  background: blue;
`;

const SideNav = styled.div`
  display: inline-block;
  width: 300px;
  background: pink;
`;

const MainContent = styled.section`
  width: 100%;
  background: green,
  display: flex;
  flex-flow: column;
`;

const TopNav = styled.div`
  width: 100%;
  background: green;
`;


const MainNav = (props) => {
  const test = 'pk';
  return (
    <ContentContainer>
      <SideNav>Hello</SideNav>
      <MainContent>
        <TopNav>Top Nav </TopNav>
        {renderRoutes(props.route.routes)}
      </MainContent>
    </ContentContainer>
  );
};

// const MainNav = (props) => {
//   const test = 'pk';
//   return (
//     <div>
//       <h1>Hello</h1>
//       {renderRoutes(props.route.routes)}
//     </div>
//   );
// };

MainNav.propTypes = {
  route: PropTypes.object,
};

export default MainNav;
