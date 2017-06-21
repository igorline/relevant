import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as errorActions from '../actions/error.actions';
import CustomSpinner from './CustomSpinner.component';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

let styles;

class ErrorComponent extends Component {
  constructor(props, context) {
    super(props, context);
    this.reload = this.reload.bind(this);
    this.state = {
      loading: false
    };
  }

  componentWillMount() {
    this.parent = this.props.parent;
  }

  componentWillReceiveProps(next) {
    if (!this.props.error[this.parent] &&
      (next.error[this.parent] || !next.error[this.parent])) this.setState({ loading: false });
  }

  componentWillUnmount() {
    this.props.actions.setError(this.parent, false);
  }

  reload() {
    this.props.actions.setError(this.parent, false);
    this.setState({ loading: true });
    this.props.reloadFunction();
  }

  render() {
    const self = this;
    let errorEl = null;

    if (this.props.error[this.parent] && !this.state.loading) {
      errorEl = (<TouchableHighlight underlayColor={'transparent'} onPress={() => self.reload()}>
        <View>
          <Image source={require('../assets/images/reload.png')} style={styles.reloadIcon} />
          <Text style={{ fontSize: 20, textAlign: 'center' }}>Reload</Text>
        </View>
      </TouchableHighlight>);
    }

    return (
      <View pointerEvents={this.props.error[this.parent] ? 'auto' : 'none'} style={styles.errorComponentContainer}>
        {errorEl}
        {/*<CustomSpinner visible={this.state.loading} />*/}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  errorComponentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    error: state.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...errorActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorComponent);

