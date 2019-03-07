import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from 'modules/animation/animation.actions';
import { globalStyles, fullWidth, fullHeight } from 'app/styles/global';
import { numbers } from 'app/utils';
import Thumb from './thumb.component';

let styles;

class IrrelevantAnimation extends Component {
  static propTypes = {
    animation: PropTypes.number
  };

  constructor(props, context) {
    super(props, context);
    this.destroy = this.destroy.bind(this);
    this.num = 0;
    this.state = {
      thumbs: {}
    };
  }

  componentWillReceiveProps(next) {
    if (next.animation !== this.props.animation) {
      this.runAnimation();
    }
  }

  componentWillUnmount() {
    this.clearAll();
  }

  clearAll() {
    this.num = 0;
    this.setState({ thumbs: {} });
  }

  destroy(key) {
    delete this.state.thumbs[key];
    this.setState({ thumbs: this.state.thumbs });
  }

  runAnimation() {
    const key = numbers.guid();

    this.state.thumbs[key] = <Thumb destroy={this.destroy} key={key} id={key} />;
    this.setState({ thumbs: this.state.thumbs });
  }

  render() {
    const thumbs = Object.keys(this.state.thumbs)
    .map(key => this.state.thumbs[key]);
    return (
      <View pointerEvents="none" style={styles.heartsContainer}>
        {thumbs}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    animation: state.animation.irrelevant
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...animationActions
      },
      dispatch
    )
  };
}

const localStyles = StyleSheet.create({
  heartsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    height: fullHeight,
    width: fullWidth
  }
});

styles = { ...globalStyles, ...localStyles };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IrrelevantAnimation);
