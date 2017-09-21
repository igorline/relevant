import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../../actions/animation.actions';
import { globalStyles, fullHeight, fullWidth } from '../../styles/global';
import Relevance from './relevant.component';

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
    };
    this.clearEls = this.clearEls.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  componentWillUpdate(next) {
    if (this.props.animation.upvote !== next.animation.upvote) {
      this.parent = next.animation.parents.upvote;
      this.investAni();
    }
  }

  componentWillUnmount() {
    this.clearEls();
  }

  clearEls() {
    this.setState({ investAni: [] });
  }

  destroy(key) {
    delete this.state.investAni[key];
    this.setState({ thumbs: this.state.investAni });
  }

  investAni() {
    this.clearEls();
    let newArr = [];
    for (let i = 0; i <= 10; i++) {
      newArr.push(<Relevance
        destroy={this.destroy}
        parent={this.parent}
        key={i}
        specialKey={i}
      />);
      this.setState({ investAni: newArr });
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

export default connect(mapStateToProps, mapDispatchToProps)(UpvoteAnimation);
