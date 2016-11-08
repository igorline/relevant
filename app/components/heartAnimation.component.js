import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Heart from './heart.component';

let styles;

class heartAnimation extends Component {
  constructor(props, context) {
    super(props, context);
    this.heartAni = this.heartAni.bind(this);
    this.num = 0;
    this.state = {
      heartAni: [],
      num: 0
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notif.count && this.props.notif.count < nextProps.notif.count) {
      let newNotifications = nextProps.notif.count - this.props.notif.count;
      this.num = newNotifications;
      this.heartAni();
    }
  }

  componentWillUnmount() {
    const self = this;
    self.clearEls();
  }

  clearEls() {
    const self = this;
    this.num = 0;
    self.setState({ heartAni: [] });
  }

  heartAni() {
    const self = this;
    let length = self.state.heartAni.length;

    if (self.num) {
      if (length < self.num) {
        let newArr = self.state.heartAni;
        newArr.push(<Heart key={length} specialKey={length} />);
        self.setState({ heartAni: newArr });
      } else {
        setTimeout(() => { self.clearEls(); }, 10000);
      }
      setTimeout(() => { self.heartAni(); }, 100);
    }
  }

  render() {
    const self = this;

    return (
      <View style={styles.heartsContainer}>
        {self.state.heartAni}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    animation: state.animation,
    notif: state.notif,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...animationActions,
    }, dispatch)
  };
}

const localStyles = StyleSheet.create({
  heartsContainer: {
    position: 'absolute',
    bottom: 0,
    left: (fullWidth / 5) * 3.4,
    height: 20,
    width: 20,
  },
});

styles = { ...globalStyles, ...localStyles };

export default connect(mapStateToProps, mapDispatchToProps)(heartAnimation);
