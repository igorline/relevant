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
import { globalStyles, blue, fullHeight, fullWidth } from '../../styles/global';
import * as authActions from '../../actions/auth.actions';
import * as navigationActions from '../../actions/navigation.actions';
import * as helper from './tooltip.helper';

let styles;
const TOOLTIP_MARGIN = 10;
const TOOLTIP_WIDTH = fullWidth - 2 * TOOLTIP_MARGIN;

class Tooltip extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 0,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      x: new Animated.Value(0),
      width: 0,
    };
    this.offset = 15;
    this.nextOnboarding = this.nextOnboarding.bind(this);
  }

  componentDidMount() {
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user && next.auth.user) {
      this.initTooltipData(next);
    }

    if (!this.props.auth.user) return;
    this.step = this.props.auth.user.onboarding;


    let id = next.tooltip.current;
    let tooltip = next.tooltip.onboarding[id];
    let nextT = next.tooltip.data[tooltip];
    // console.log(tooltip);
    // console.log(nextT);
    if (nextT && nextT.toggle && tooltip !== next.tooltip.showing.name) {
      // console.log('trigger ', tooltip);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => nextT.toggle(), 300);
    }



    if (next.tooltip.showing.name !== this.props.tooltip.showing.name) {
      let tooltip = next.tooltip.showing;

      if (tooltip && tooltip.name) {
        Animated.spring(this.state.scale, {
          toValue: 1,
          delay: 0,
          // duration: 200,
          // easing: Easing.in(Easing.elastic(1.0)),
          useNativeDriver: true,
          velocity: 25,
          // tension: 100,
          friction: 10
          // easing: Easing.in(Easing.cubic)
        }).start();
        Animated.spring(this.state.opacity, {
          toValue: 1,
          delay: 0,
          // duration: 200,
          // easing: Easing.out(Easing.cubic),
          velocity: 25,
          // tension: 50,
          friction: 10,
          useNativeDriver: true,
        }).start();
      } else {
        this.setState({
          scale: new Animated.Value(0.0),
          // opacity: new Animated.Value(0),
          x: new Animated.Value(0),
        });
      }
    }
  }

  initTooltipData(props) {
    helper.tooltips.forEach(tooltip => {
      this.props.actions.setTooltipData(helper.data[tooltip]);
    });

    setTimeout(() => {
      this.props.actions.setCurrentTooltip(this.props.auth.user.onboarding);
    }, 2000);
  }

  nextOnboarding() {
    let current = this.props.tooltip.showing.name;

    let index = this.props.tooltip.onboarding.findIndex(t => t === current);
    this.props.actions.showTooltip(null);
    // if (this.step >= 3) {
    //   this.props.actions.setOnboardingStep(0);
    // }
    if (index === this.step) {
      this.props.actions.setOnboardingStep(this.step + 1);
    }
  }

  render() {
    if (!this.props.auth.user) return null;
    let tooltip = this.props.tooltip.showing;
    if (!tooltip || !tooltip.name) return null;
    if (!tooltip.parent) return null;
    let style = { opacity: this.state.opacity };
    let arrowStyle = [];
    let transform = [{ scale: this.state.scale }];

    let parent = tooltip.parent;

    if (tooltip.vertical === 'bottom') {
      transform = [...transform,
        { translateY: this.state.height / 2 }
      ];
      style = {
        ...style,
        top: parent.y + parent.h + tooltip.verticalOffset - this.state.height / 2,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        { top: -4 },
      ];
    }

    if (tooltip.vertical === 'top') {
      transform = [...transform,
        { translateY: - this.state.height / 2 }
      ];
      style = {
        ...style,
        top: parent.y - this.state.height / 2 - tooltip.verticalOffset,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        styles.arrowBottom,
        { bottom: -4 }
      ];
    }

    if (tooltip.horizontal === 'right') {
      let offset = tooltip.horizontalOffset;
      let px = parent.w / 2 + parent.x + offset * 2;
      let o = fullWidth - px - TOOLTIP_MARGIN;

      let x = this.state.scale.interpolate({
        inputRange: [0, 1],
        outputRange: [0, - TOOLTIP_WIDTH + TOOLTIP_WIDTH / 2 + o + TOOLTIP_MARGIN],
      });

      transform = [
        { translateX: x },
        ...transform,
      ];
      style = {
        ...style,
        left: px - TOOLTIP_WIDTH / 2 - TOOLTIP_MARGIN,
        transform,
      };
      arrowStyle = [
        ...arrowStyle,
        { right: fullWidth - px - TOOLTIP_MARGIN - 6 },
      ];
    }

    if (tooltip.horizontal === 'left') {
      // transform = [...transform,
        // { translateX: -this.state.width / 2 }];
      style = {
        ...style,
        left: parent.x + tooltip.horizontalOffset,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        { left: 8 },
      ];
    }

    if (tooltip.horizontal === 'center') {
      // transform = [...transform,
        // { translateX: -this.state.width / 2 }];
      style = {
        ...style,
        width: tooltip.width,
        left: parent.x + parent.w / 2 - this.state.width / 2 + tooltip.horizontalOffset,
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
        underlayColor={'hsla(240,70%,50%,0.4)'}
        style={styles.overlay}
        onPress={this.nextOnboarding}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'hsla(240,70%,50%,0.4)',
            opacity: this.state.opacity
          }}
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
            style={{ padding: 0 }}
            onPress={this.nextOnboarding}
          >
            {helper.text[tooltip.name]({
              ...this.props,
              style: styles.tooltipText,
              ...tooltip
            })}
          </TouchableHighlight>
        </Animated.View>
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
    // backgroundColor: 'hsla(240,70%,50%,0.4)',
    // backgroundColor: 'hsla(240,70%,0%,0.4)'
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    // backgroundColor: 'hsla(240,100%,80%,1)',
    // borderRadius: 5,
    padding: 15,
    paddingVertical: 20,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.8,
    zIndex: 1000000,
    width: TOOLTIP_WIDTH,

  },
  tooltipText: {
    // fontFamily: 'Helvetica',
    fontWeight: '100',
    fontSize: 15,
    lineHeight: 20,
  },
  arrow: {
    width: 10,
    height: 10,
    position: 'absolute',
    transform: [{ rotate: '35deg' }, { skewY: '45deg' }],
    backgroundColor: 'white',
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
    tooltip: state.tooltip,
    nav: state.navigation
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
