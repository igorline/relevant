import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
import Heart from './heart.component';

let styles;

class heartAnimation extends Component {
  static propTypes = {
    notif: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.heartAni = this.heartAni.bind(this);
    this.num = 0;
    this.state = {
      heartAni: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notif.count && this.props.notif.count < nextProps.notif.count) {
      const newNotifications = nextProps.notif.count - this.props.notif.count;
      this.num = newNotifications;
      this.heartAni();
    }
  }

  componentWillUnmount() {
    this.clearEls();
  }

  clearEls() {
    this.num = 0;
    this.setState({ heartAni: [] });
  }

  heartAni() {
    const length = this.state.heartAni.length;
    const delay = 500 / this.num;

    if (length < this.num) {
      const newArr = this.state.heartAni;
      newArr.push(<Heart delay={delay} key={length} specialKey={length} />);
      this.setState({ heartAni: newArr });
      setTimeout(() => {
        this.heartAni();
      }, delay);
    } else {
      setTimeout(() => {
        this.clearEls();
      }, 2000);
    }
  }

  render() {
    return (
      <View pointerEvents="none" style={styles.heartsContainer}>
        {this.state.heartAni}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    animation: state.animation,
    notif: state.notif
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
)(heartAnimation);
