import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../../actions/animation.actions';
import { globalStyles } from '../../styles/global';
import Dollar from './dollar.component';

const localStyles = StyleSheet.create({
  moneyContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 40,
    width: 80,
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

  componentWillUpdate(next) {
    if (this.props.animation.invest !== next.animation.invest) {
      this.amount = next.animation.amount;
      this.investAni();
    }
  }

  componentWillUnmount() {
    this.clearEls();
  }

  clearEls() {
    if (this.state.num > 0) this.setState({ num: 0, investAni: [] });
  }

  investAni() {
    if (this.state.num < 15) {
      let newArr = this.state.investAni;
      newArr.push(<Dollar amount={this.amount} key={this.state.num} specialKey={this.state.num} />);
      let newNum = this.state.num += 1;
      this.setState({ num: newNum, investAni: newArr });
      setTimeout(() => { this.investAni(); }, 50 * Math.random());
    } else {
      setTimeout(() => { this.clearEls(); }, 1000);
    }
  }

  render() {
    return (
      <View pointerEvents={'none'} style={styles.moneyContainer}>
        {this.state.investAni}
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
