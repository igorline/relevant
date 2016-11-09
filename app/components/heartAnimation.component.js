import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth } from '../styles/global';
import Heart from './heart.component';

let styles;

class heartAnimation extends Component {
  constructor(props, context) {
    super(props, context);
    this.heartAni = this.heartAni.bind(this);
    this.num = 0;
    this.state = {
      heartAni: [],
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
    this.clearEls();
  }

  clearEls() {
    this.num = 0;
    this.setState({ heartAni: [] });
  }

  heartAni() {
    let length = this.state.heartAni.length;

    if (length < this.num) {
      let newArr = this.state.heartAni;
      newArr.push(<Heart key={length} specialKey={length} />);
      this.setState({ heartAni: newArr });
      setTimeout(() => { this.heartAni(); }, 100);
    } else setTimeout(() => { this.clearEls(); }, 10000);
  }

  render() {
    return (
      <View style={styles.heartsContainer}>
        {this.state.heartAni}
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
