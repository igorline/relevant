import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as authActions from '../actions/auth.actions';
import * as errorActions from '../actions/error.actions';
import * as navigationActions from '../actions/navigation.actions';

import { globalStyles, localStyles } from '../styles/global';

let styles;

class ErrorContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.reload = this.reload.bind(this);
  }

  componentWillUnmount() {
    this.props.actions.setError('universal', false);
  }

  reload() {
    this.props.actions.getUser();
  }

  render() {
    return (<View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
      <TouchableHighlight underlayColor={'transparent'} onPress={() => this.reload()}>
        <Text>Reload</Text>
      </TouchableHighlight>
    </View>)
  }
}

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    error: state.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...navigationActions,
        ...errorActions
      },
      dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(ErrorContainer);
