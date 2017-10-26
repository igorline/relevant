import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../../actions/animation.actions';
import { globalStyles, fullHeight, fullWidth } from '../../styles/global';
import Vote from './vote.component';
import Coin from './coinVote.component';

const localStyles = StyleSheet.create({
  moneyContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: fullHeight,
    width: fullWidth,
  }
});

const styles = { ...globalStyles, ...localStyles };

class UpvoteAnimation extends Component {
  constructor(props, context) {
    super(props, context);
    this.enabled = true;
    this.state = {
      investAni: [],
      coinAni: [],
    };
    this.clearEls = this.clearEls.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  componentWillUpdate(next) {
    if (this.props.animation.upvote !== next.animation.upvote) {
      this.parent = next.animation.parents.upvote;
      this.amount = Math.min(20, next.animation.amount.upvote) || 10;
      this.investAni();
    }
  }

  componentWillUnmount() {
    this.clearEls();
  }

  clearEls() {
    this.setState({ investAni: [], coinAni: [] });
  }

  destroy(key, coinKey) {
    if (typeof key === 'number') {
      delete this.state.investAni[key];
    }
    if (typeof coinKey === 'number') {
      delete this.state.coinAni[coinKey];
    }
  }

  investAni() {
    // this.clearEls();
    let newArr = [];
    let coinArr = [];
    for (let i = 0; i <= 10; i++) {
      newArr.push(<Vote
        destroy={this.destroy}
        parent={this.parent}
        key={i}
        specialKey={i}
      />);
    }

    for (let i = 0; i < this.amount; i++) {
      coinArr.push(<Coin
        destroy={this.destroy}
        parent={this.parent}
        amount={this.amount}
        key={i}
        specialKey={i}
      />);
    }
    this.setState({ coinAni: coinArr, investAni: newArr });
  }

  render() {
    return (
      <View pointerEvents={'none'} style={styles.moneyContainer}>
        {this.state.coinAni}
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

export default connect(mapStateToProps, mapDispatchToProps)(UpvoteAnimation);
