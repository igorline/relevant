import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from 'modules/animation/animation.actions';
import styled from 'styled-components/primitives';
import Vote from './vote.component';
import VoteNumber from './upvoteNumber.component';

const MoneyContainer = styled.View`
  position: absolute
  zIndex: 10000;
  left: 0;
  top: 0;
  right: 0;
`;

class UpvoteAnimation extends Component {
  static propTypes = {
    animation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.enabled = true;
    this.state = {
      investAni: [],
      coinAni: []
    };
    this.clearEls = this.clearEls.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  componentDidMount() {
    const { Dimensions } = require('react-native');
    this.fullHeight = Dimensions.get('window').height;
  }

  componentWillUpdate(next) {
    if (this.props.animation.upvote !== next.animation.upvote) {
      this.parent = next.animation.parents.upvote;
      this.amount = next.animation.amount.upvote;
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
      const investAni = [...this.state.investAni];
      investAni[key] = null;
      this.setState({ investAni });
    }
    if (typeof coinKey === 'number') {
      const coinAni = [...this.state.coinAni];
      coinAni[coinKey] = null;
      this.setState({ coinAni });
    }
  }

  investAni() {
    const newArr = [];
    const coinArr = [];
    for (let i = 0; i <= 10; i++) {
      newArr.push(
        <Vote destroy={this.destroy} parent={this.parent} key={i} specialKey={i} />
      );
    }

    const i = 0;
    if (this.amount) {
      coinArr.push(
        <VoteNumber
          destroy={this.destroy}
          parent={this.parent}
          amount={this.amount}
          key={i}
          specialKey={i}
        />
      );
    }
    this.setState({ coinAni: coinArr, investAni: newArr });
  }

  render() {
    return (
      <MoneyContainer pointerEvents={'none'} style={{ height: this.fullHeight }}>
        {this.state.coinAni}
        {this.state.investAni}
      </MoneyContainer>
    );
  }
}

function mapStateToProps(state) {
  return {
    animation: state.animation
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpvoteAnimation);
