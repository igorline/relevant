import React, { Component } from 'react';
import {
  Text,
  Animated,
  View,
  StyleSheet,
  Easing,
  TouchableHighlight
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles, blue, fullHeight, fullWidth } from '../styles/global';
import * as authActions from '../actions/auth.actions';
import * as navigationActions from '../actions/navigation.actions';

let styles;

class Tooltip extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 0,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      width: 0,
    };
    this.offset = 15;
    this.steps = [
      'coin', 'relevance', 'end'
    ];
    this.nextOnboarding = this.nextOnboarding.bind(this);
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user) return;
    this.step = this.steps.indexOf(this.props.auth.user.onboarding);

    if (next.tooltip !== this.props.tooltip) {
      if (next.tooltip.name) {
        Animated.timing(this.state.scale, {
          toValue: 1,
          delay: 0,
          duration: 400,
          easing: Easing.in(Easing.elastic(1.3))
        }).start();
        Animated.timing(this.state.opacity, {
          toValue: 1,
          delay: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic)
        }).start();
      } else {
        this.setState({ scale: new Animated.Value(0.0), opacity: new Animated.Value(0) });
      }

      clearTimeout(this.timeout);
      // this.timeout = setTimeout(this.nextOnboarding, 8000);
    }
  }

  nextOnboarding() {
    clearTimeout(this.timeout);
    this.props.actions.showTooltip(null);
    // this.props.actions.setOnboardingStep('coin');
    if (this.step >= 0) {
      this.props.actions.setOnboardingStep(this.steps[this.step + 1]);
    }
  }

  render() {
    if (!this.props.auth.user) return null;
    if (!this.props.tooltip.name) return null;
    let style = { opacity: this.state.opacity };
    let arrowStyle = [];
    let transform = [{ scale: this.state.scale }];

    let parent = this.props.tooltip.parent;
    // console.log('onboarding ', this.props.auth.user.onboarding);
    // if (this.props.tooltip.name !== this.props.auth.user.onboarding) {
    //   return null;
    // }

    if (this.props.tooltip.vertical === 'bottom') {
      transform = [...transform,
        { translateY: this.state.height / 2 }
      ];
      style = {
        ...style,
        top: parent.y + parent.h + this.props.tooltip.verticalOffset - this.state.height / 2,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        { top: -4 },
      ];
    }

    if (this.props.tooltip.vertical === 'top') {
      transform = [...transform];
      style = {
        ...style,
        top: parent.y - this.state.height - this.props.tooltip.verticalOffset,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        styles.arrowBottom,
        { bottom: -4 }
      ];
    }

    if (this.props.tooltip.horizontal === 'right') {
      transform = [...transform,
        { translateX: -this.state.width / 2 }];
      style = {
        ...style,
        left: parent.x + parent.w + this.props.tooltip.horizontalOffset - (this.state.width / 2),
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        { right: 8 },
      ];
    }

    if (this.props.tooltip.horizontal === 'left') {
      // transform = [...transform,
        // { translateX: -this.state.width / 2 }];
      style = {
        ...style,
        left: parent.x + this.props.tooltip.horizontalOffset,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        { left: 8 },
      ];
    }

    if (this.props.tooltip.horizontal === 'center') {
      // transform = [...transform,
        // { translateX: -this.state.width / 2 }];
      style = {
        ...style,
        width: this.props.tooltip.width,
        left: parent.x + parent.w / 2 -this.state.width / 2 + this.props.tooltip.horizontalOffset,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        ...styles.arrowBottom,
        { left: this.state.width / 2 },
      ];
    }

    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={styles.overlay}
        onPress={this.nextOnboarding}
      >
        <Animated.View
          style={[styles.tooltip, style]}
          onLayout={(e) => {
            let { width, height } = e.nativeEvent.layout;
            this.setState({ height, width });
          }}
        >
          <View style={[styles.arrow, ...arrowStyle]} />
          <TouchableHighlight
            underlayColor={'transparent'}
            style={{ padding: 10 }}
            onPress={this.nextOnboarding}
          >
            <Text style={styles.tooltipText}>
              {this.props.tooltip.text}
            </Text>
          </TouchableHighlight>
        </Animated.View>
      </TouchableHighlight>
    );
  }
}

let localStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: fullWidth,
    height: fullHeight,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.0)'
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: blue,
    borderRadius: 5,
    // padding: 10,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.8,
    zIndex: 1000000
  },
  tooltipText: {
    color: 'white',
  },
  arrow: {
    width: 10,
    height: 10,
    position: 'absolute',
    transform: [{ rotate: '35deg' }, { skewY: '45deg' } ],
    backgroundColor: blue,
    shadowColor: 'black',
    shadowOffset: { width: -1, height: -1 },
    shadowRadius: 0,
    shadowOpacity: 0.1,
  },
  arrowBottom: {
    shadowOffset: { width: 1, height: 1 },
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    tooltip: state.tooltip
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...navigationActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
