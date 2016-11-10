import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  TouchableHighlight
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as authActions from '../actions/auth.actions';
import * as errorActions from '../actions/error.actions';
import * as navigationActions from '../actions/navigation.actions';
import CustomSpinner from '../components/CustomSpinner.component';

import { globalStyles, localStyles } from '../styles/global';

let styles;

class ErrorContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
    }
    this.reload = this.reload.bind(this);
  }

  componentWillUnmount() {
    this.props.actions.setError('universal', false);
  }

  componentWillReceiveProps(next) {
    if (!this.props.error.universal && next.error.universal) this.setState({ loading: false })
  }

  reload() {
    this.props.actions.setError('universal', false);
    this.setState({ loading: true })
    this.props.actions.getUser();
  }

  render() {
    let reloadEl = null;
    if (!this.state.loading) {
      reloadEl = (<TouchableHighlight underlayColor={'transparent'} onPress={() => this.reload()}>
        <View>
          <Image source={require('../assets/images/reload.png')} style={styles.reloadIcon} />
          <Text style={{ fontSize: 20, textAlign: 'center' }}>Reload</Text>
        </View>
      </TouchableHighlight>);
    }

    return (<View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
      {reloadEl}
      <CustomSpinner visible={this.state.loading} />
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
