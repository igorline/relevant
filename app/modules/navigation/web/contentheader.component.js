import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import ActivityButton from 'modules/activity/web/activityButton.component';
import AuthContainer from 'modules/auth/web/auth.container';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { colors, layout, sizing } from 'app/styles';
import RequestInvite from 'modules/web_splash/requestInvite.component';

const Nav = styled.nav`
  width: 100%;
  background-image: linear-gradient(hsla(0,0%,100%, 1) 70%, hsla(0,0%,100%, 0) 100%);
  display: flex;
  padding: 0 ${sizing.byUnit(4)};
  justify-content: space-between;
  align-items: center;
  height: ${layout.headerHeight};
  /* border-bottom: ${layout.borderStyles(colors.lineColor)}; */
`;

const NewPost = styled.button`
  ${layout.button}
`;

const Login = styled.a`
  ${layout.linkStyle}
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

  renderSubHeader() {
    const loggedIn = this.props.auth.isAuthenticated;
    let cta;

    const signup = (
      <div className="signupCTA">
        <Link to="/user/login">
          <NewPost>Login</NewPost>
        </Link>
        <span>{' '}</span>
        <Link to="/user/signup">
          <NewPost>Sign Up</NewPost>
        </Link>
      </div>
    );

    if (!loggedIn) {
      cta = <RequestInvite type={'app'} cta={signup} />;
    }
    return cta;
  }

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
      <div>
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
                <Login onClick={this.toggleLogin} color={colors.blue}>Login</Login>
            }

          </SubNav>
          <AuthContainer
            toggleLogin={this.toggleLogin.bind(this)}
            open={this.state.openLoginModal || temp}
            modal
            {...this.props}
          />
        </Nav>
        {this.renderSubHeader()}
      </div>
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
