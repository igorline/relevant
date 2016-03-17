'use strict';

import React, { Component } from 'react-native';
import {bindActionCreators} from 'redux';
import Auth from '../components/auth';
import * as authActions from '../actions/authActions';
import { connect } from 'react-redux';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, actions } = this.props;
    return (
      <Auth { ...this.props } />
    );
  }
}

export default connect(state => ({
    state: state.auth
  }),
  (dispatch) => ({
    actions: bindActionCreators(authActions, dispatch)
  })
)(Home);