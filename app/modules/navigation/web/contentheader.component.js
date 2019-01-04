import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import ActivityButton from 'modules/activity/web/activityButton.component';
import styled from 'styled-components';
import { connect } from 'react-redux';


const Nav = styled.section`
  width: 100%;
  background: white;
  display: flex;
  padding: 1.5em;
  justify-content: space-between;
  line-height: 20px;
  align-items: center;
`;

const NewPost = styled.button`
  background: blue;
  color: white;
  display: flex;
  border: none;
  justify-content: space-between;
  height: 4em;
  padding: 0 3em;
  font-size: 14px;
  a {
    color: white;
  }
`;

const SubNav = styled.div`
  display: flex;
  flex-direction: row;
`;

const ActivityButtonContainer = styled.span`
  position: relative;
  z-index: 1;
`;

export const tabStyles = `
  color: hsl(0, 0%, 80%);
  font-weight: bold;
  font-size: 24px;
  &.${'active'} {
    color: black;
    fontWeight: 'bold'
  }
`;

const ContentHeader = (props) => {
  const { location, auth } = props;
  return (
    <Nav>
      <DiscoverTabs tabStyles={tabStyles} />
      <SubNav>
        <ActivityButtonContainer>
          <ActivityButton tabStyles={tabStyles} />
        </ActivityButtonContainer>
        <Link to={location.pathname + '#newpost'} disabled={!auth.user}>
          <NewPost >
              New Post
          </NewPost>
        </Link>
      </SubNav>
    </Nav>
  );
};

ContentHeader.propTypes = {
  location: PropTypes.object,
  auth: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}


export default withRouter(connect(
  mapStateToProps,
)(ContentHeader));
