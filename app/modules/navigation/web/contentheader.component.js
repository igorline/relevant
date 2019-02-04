import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Header,
} from 'modules/styled/web';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import ActivityButton from 'modules/activity/web/activityButton.component';
import AuthContainer from 'modules/auth/web/auth.container';
import styled from 'styled-components';
import { colors, layout, sizing } from 'app/styles';
import RequestInvite from 'modules/web_splash/requestInvite.component';
import { showModal } from 'modules/navigation/navigation.actions';

const Nav = styled.nav`
  position: fixed;
  background-image: linear-gradient(hsla(0,0%,100%, 1) 70%, hsla(0,0%,100%, 0) 100%);
  display: flex;
  flex: 1;
  z-index: 100;
  height: ${layout.headerHeight};
  padding: 0 ${sizing(4)};
  justify-content: space-between;
  align-items: center;
  top: 0;
  right: 0px;
  left: ${layout.sideNavWidth};
`;


const SubNav = styled.div`
  display: flex;
  flex-direction: row;
`;

const GetStarted = styled(Header)`
  cursor: pointer;
  color: ${colors.grey};
  &:hover {
    color: ${colors.black}
  }
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
        <Link to="/user/login" >
          <Button mr={4}>Login</Button>
        </Link>
        <Link to="/user/signup">
          <Button>Sign Up</Button>
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
    const { location, auth, className, actions } = this.props;
    const { user } = auth;
    const temp = user && user.role === 'temp';
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Nav className={className}>
          <DiscoverTabs />
          <SubNav>
            <GetStarted
              onClick={() => actions.showModal('onboarding')}
              align={'center'}
              mr={2}
              c={colors.grey}
            >
              Get Started
            </GetStarted>
            <ActivityButtonContainer>
              <ActivityButton />
            </ActivityButtonContainer>
            {
              auth.isAuthenticated
                ?
                <Link to={location.pathname + '#newpost'} disabled={!auth.user}>
                  <Button>
                    New Post
                  </Button>
                </Link>
                :
                <Button onPress={this.toggleLogin} color={colors.blue}>Login</Button>
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
  dispatch => ({
    actions: bindActionCreators({ showModal }, dispatch)
  })
)(ContentHeader));
