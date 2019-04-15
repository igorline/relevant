import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { hideModal, showModal } from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';
import queryString from 'query-string';

class AuthContainer extends Component {
  static propTypes = {
    auth: PropTypes.object,
    location: PropTypes.object,
    modal: PropTypes.bool,
    actions: PropTypes.object,
    user: PropTypes.object,
    open: PropTypes.bool,
    match: PropTypes.object,
    history: PropTypes.object,
    type: PropTypes.string
  };

  constructor(props) {
    super(props);
    // this.login = this.login.bind(this);
    // this.signup = this.signup.bind(this);
    this.logout = this.logout.bind(this);
    // this.sendMessage = this.sendMessage.bind(this);
    // this.authNav = this.authNav.bind(this);
    // this.close = this.close.bind(this);

    const { community } = this.props.auth;

    // TODO default view '/'
    const defaultRoute = community ? `/${community}/new` : '/relevant/new';

    const { redirect } = queryString.parse(this.props.location.search);
    const redirectRoute = redirect || defaultRoute;

    this.state = {
      redirectTo: redirectRoute,
      type: props.type
    };
    this.props.actions.hideModal();
  }

  componentDidMount() {
    this.openModal();
  }

  componentWillReceiveProps(next) {
    if (!this.state.type) this.setState({ type: next.type || 'login' });
    if (this.props.modal) return;
    const { redirect } = queryString.parse(this.props.location.search);
    const redirectTo = redirect;
    if (!this.props.auth.user && next.auth.user && redirectTo) {
      this.props.history.push(redirectTo);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modal !== this.props.modal) {
      // console.log('modal changed');
      this.openModal();
    }
  }

  openModal() {
    // console.log('open modal');
    const { user, match, modal } = this.props;
    let path = modal ? this.state.type : match.path.replace('/user/', '');

    if (user && user.role === 'temp') {
      path = 'signup';
    }
    if (modal) {
      // visible = open;
    }

    // let title = '';

    if (path === 'confirm/:user/:code' || path === 'confirm') {
      this.props.actions.showModal('confirm');
      // confirm = true;
      // auth = <ConfirmEmail authNav={this.authNav} {...this.props} />;
      // title = 'Confirm Your Email';
    } else if (path === 'forgot') {
      this.props.actions.showModal('forgot');
      // auth = <Forgot authNav={this.authNav} {...this.props} />;
      // title = 'Recover Password';
      // } else if (isAuthenticated) {
      //   auth = <button onClick={() => this.logout()}>logout</button>;
    } else if (path === 'login') {
      this.props.actions.showModal('login');
      // auth = (
      //   <LoginForm authNav={this.authNav} parentFunction={this.login} {...this.props} />
      // );
      // title = 'Sign In';
    } else if (path === 'signup') {
      this.props.actions.showModal('signup');
      // auth = (
      //   <SignupForm authNav={this.authNav} parentFunction={this.signup} {...this.props} />
      // );
      // title = 'Join the Community';
    } else if (path === 'resetPassword/:token' || path === 'resetPassword') {
      // console.log('calling show modal');
      this.props.actions.showModal('resetPassword');
      // return null;
      // auth = (
      //   <ResetPassword
      //     authNav={this.authNav}
      //     {...this.props}
      //     close={this.close.bind(this)}
      //   />
      // );
      // title = 'Reset Password';
    }
    // if (!visible) return null;
  }

  // async login(data) {
  //   try {
  //     const user = {
  //       name: data.username,
  //       password: data.password
  //     };
  //     const loggedIn = await this.props.actions.loginUser(user);
  //     if (loggedIn) this.close();
  //   } catch (err) {
  //     // TODO error handling
  //   }
  // }

  // authNav(type) {
  //   const { location, modal, history } = this.props;
  //   if (modal) this.setState({ type });
  //   else history.push(`/user/${type}` + location.search);
  // }

  // async signup(data) {
  //   const { invitecode } = this.props.auth;
  //   const { createUser } = this.props.actions;
  //   try {
  //     const user = {
  //       name: data.username,
  //       email: data.email,
  //       password: data.password,
  //       image: data.image
  //     };
  //     const signedUp = await createUser(user, invitecode);
  //     if (signedUp) this.close();
  //   } catch (err) {
  //     // TODO error handling
  //   }
  // }

  logout() {
    this.props.actions.logoutAction();
  }

  // sendMessage() {
  //   this.props.dispatch(this.props.actions.hello);
  // }

  // close() {
  //   this.authNav('login');
  //   if (this.props.toggleLogin) {
  //     this.props.toggleLogin();
  //   } else {
  //     this.props.history.push(this.state.redirectTo);
  //   }
  // }

  render() {
    const { user, match, modal, open } = this.props;
    // let confirm;
    // let auth;
    let visible = true;

    let path = modal ? this.state.type : match.path.replace('/user/', '');

    if (user && user.role === 'temp') {
      path = 'signup';
      // confirm = true;
    }
    if (modal) {
      visible = open;
    }

    // let title = '';

    if (path === 'confirm/:user/:code' || path === 'confirm') {
      // confirm = true;
      // auth = <ConfirmEmail authNav={this.authNav} {...this.props} />;
      // title = 'Confirm Your Email';
    } else if (path === 'forgot') {
      // auth = <Forgot authNav={this.authNav} {...this.props} />;
      // title = 'Recover Password';
      // } else if (isAuthenticated) {
      //   auth = <button onClick={() => this.logout()}>logout</button>;
    } else if (path === 'login') {
      // auth = (
      //   <LoginForm authNav={this.authNav} parentFunction={this.login} {...this.props} />
      // );
      // title = 'Sign In';
    } else if (path === 'signup') {
      // auth = (
      //   <SignupForm authNav={this.authNav} parentFunction={this.signup} {...this.props} />
      // );
      // title = 'Join the Community';
    } else if (path === 'resetPassword/:token' || path === 'resetPassword') {
      // this.props.actions.showModal('resetPassword');
      return null;
      // auth = (
      //   <ResetPassword
      //     authNav={this.authNav}
      //     {...this.props}
      //     close={this.close.bind(this)}
      //   />
      // );
      // title = 'Reset Password';
    }

    if (!visible) return null;

    return <div />;
    // return (
    //   <Modal visible={visible} close={this.close.bind(this)} title={title}>
    //     <div>
    //       {user && !confirm ? (
    //         <div className="authStatus">You are logged in as @{user.handle}</div>
    //       ) : (
    //         ''
    //       )}
    //       {auth}
    //     </div>
    //   </Modal>
    // );
  }
}

const mapStateToProps = state => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
      hideModal,
      showModal
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthContainer)
);
