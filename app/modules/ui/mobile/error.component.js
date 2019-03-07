import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles } from 'app/styles/global';
import * as errorActions from 'modules/ui/error.actions';

let styles;

class ErrorComponent extends Component {
  static propTypes = {
    actions: PropTypes.object,
    parent: PropTypes.string,
    reloadFunction: PropTypes.func,
    error: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.reload = this.reload.bind(this);
  }

  reload() {
    this.setState({ loading: true });
    this.props.actions.setError(this.props.parent, false);
    this.props.reloadFunction();
  }

  render() {
    let errorEl = null;

    if (this.props.error) {
      errorEl = (
        <TouchableHighlight underlayColor={'transparent'} onPress={() => this.reload()}>
          <View>
            <Image source={require('app/public/img/reload.png')} style={styles.reloadIcon} />
            <Text style={{ fontSize: 20, textAlign: 'center' }}>Reload</Text>
          </View>
        </TouchableHighlight>
      );
    }

    return (
      <View
        pointerEvents={this.props.error ? 'auto' : 'none'}
        style={styles.errorComponentContainer}
      >
        {errorEl}
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
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    error: state.error
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...errorActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorComponent);
