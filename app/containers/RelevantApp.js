'use strict';

import React, { Component } from 'react-native';
import {bindActionCreators} from 'redux';
import Login from '../components/login';
import * as relevantActions from '../actions/relevantActions';
import { connect } from 'react-redux';

class RelevantApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, actions } = this.props;
    return (
      <Login />
    );
  }
}

export default connect(state => ({
    state: state.relevant
  }),
  (dispatch) => ({
    actions: bindActionCreators(relevantActions, dispatch)
  })
)(RelevantApp);