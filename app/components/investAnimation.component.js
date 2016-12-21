import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Dollar from './dollar.component';

const localStyles = StyleSheet.create({
  moneyContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    height: 20,
    width: 20,
  }
});

const styles = { ...globalStyles, ...localStyles };

class InvestAnimation extends Component {
  constructor(props, context) {
    super(props, context);
    this.enabled = true;
    this.state = {
      investAni: [],
      num: 0
    };
  }

  componentDidUpdate(prev) {
    const self = this;
    if (self.props.animation !== prev.animation) {
      if (self.props.animation.bool && self.props.animation.run) {
        if (self.props.animation.type === 'invest') {
          this.enabled = true;
          self.investAni();
        }
      }
    }
  }

  componentWillUnmount() {
    const self = this;
    self.clearEls();
  }

  clearEls() {
    const self = this;
    this.enabled = false;
    if (self.state.num > 0) self.setState({ num: 0, investAni: [] });
  }

  investAni() {
    const self = this;
    if (!this.enabled) return;
    if (self.state.num < 25) {
      let newArr = self.state.investAni;
      newArr.push(<Dollar key={self.state.num} specialKey={self.state.num} />);
      let newNum = self.state.num += 1;
      self.setState({ num: newNum, investAni: newArr });
      setTimeout(() => { self.investAni(); }, 50);
    } else {
      setTimeout(() => { self.clearEls(); }, 1000);
    }
  }

  render() {
    const self = this;

    return (
      <View style={styles.moneyContainer}>
        {self.state.investAni}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    animation: state.animation,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...animationActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvestAnimation);
