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
  aniMoney: {
    position: 'absolute',
    top: -35,
    right: 10,
    backgroundColor: 'transparent'
  },
});

 const styles = { ...globalStyles, ...localStyles };

class InvestAnimation extends Component {
  constructor(props, context) {
    super(props, context);
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
    console.log('clearEls');
    if (self.state.num > 0) self.setState({ num: 0, investAni: [] });
  }

  investAni() {
    const self = this;
    if (self.state.num < 25) {
      let newArr = self.state.investAni;
      newArr.push(<Dollar key={self.state.num} />);
      let newNum = self.state.num += 1;
      self.setState({ num: newNum, investAni: newArr });
    }
    setTimeout(() => { self.investAni(); }, 100);
  }

  render() {
    const self = this;

    return (
      <View style={{ position: 'absolute', top: 0, right: 0, height: 20, width: 20 }}>
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
