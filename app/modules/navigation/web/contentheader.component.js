import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import ActivityButton from 'modules/activity/web/activityButton.component';
import AuthContainer from 'modules/auth/web/auth.container';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { colors, layout } from 'app/styles/globalStyles';

const Nav = styled.nav`
  width: 100%;
  background: white;
  display: flex;
  padding: 0 1.5em;
  justify-content: space-between;
  line-height: 20px;
  align-items: center;
  height: ${layout.headerHeight};
  border-bottom: ${layout.borderStyles(colors.borderColor)};
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


class ContentHeader extends Component {
  static propTypes = {
    // auth: PropTypes.object,
  };

  state = {
    openLoginModal: false
  };

  toggleLogin = () => {
    this.setState({ openLoginModal: !this.state.openLoginModal });
  }

  closeModal() {
    this.props.history.push(this.props.location.pathname);
  }

  render() {
    const { location, auth, className } = this.props;
    const { user } = auth;
    const temp = user && user.role === 'temp';
    return (
      <Nav className={className}>
        <DiscoverTabs />
        <SubNav>
          <ActivityButtonContainer>
            <ActivityButton />
          </ActivityButtonContainer>
          {
            auth.isAuthenticated ?
              <Link to={location.pathname + '#newpost'} disabled={!auth.user}>
                <NewPost >
                    New Post
                </NewPost>
              </Link>
              :
              <div>
                <div onClick={this.toggleLogin}>Login</div>
              </div>
          }

        </SubNav>
        <AuthContainer
          toggleLogin={this.toggleLogin.bind(this)}
          open={this.state.openLoginModal || temp}
          modal
          {...this.props}
        />
      </Nav>
    );
  }
}


ContentHeader.propTypes = {
  location: PropTypes.object,
  auth: PropTypes.object,
  history: PropTypes.object,
  className: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}


export default withRouter(connect(
  mapStateToProps,
)(ContentHeader));
