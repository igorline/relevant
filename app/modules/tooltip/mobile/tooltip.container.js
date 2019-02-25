import React, { Component } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  TouchableHighlight,
  Platform,
  Text,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  globalStyles,
  fullHeight,
  fullWidth,
  blue,
  smallScreen
} from 'app/styles/global';
import * as authActions from 'modules/auth/auth.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as helper from './tooltip.helper';
import * as tooltipActions from '../tooltip.actions';

let styles;
const TOOLTIP_MARGIN = smallScreen ? 4 : 10;
const TOOLTIP_WIDTH = fullWidth - 2 * TOOLTIP_MARGIN;

class Tooltip extends Component {
  static propTypes = {
    tooltip: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 0,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      x: new Animated.Value(0),
      width: 0
    };
    this.offset = 15;
    this.nextOnboarding = this.nextOnboarding.bind(this);
  }

  componentWillReceiveProps(next) {
    if (!this.props.tooltip.ready && next.tooltip.ready) {
      this.initTooltipData(next);
    }

    if (!this.props.auth.user) return;
    this.step = this.props.auth.user.onboarding;

    const id = next.tooltip.current;
    const tooltipId = next.tooltip.onboarding[id];
    const nextT = next.tooltip.data[tooltipId];
    if (nextT && nextT.toggle && tooltipId !== next.tooltip.showing.name) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => nextT.toggle(), 300);
    }

    if (next.tooltip.showing.name !== this.props.tooltip.showing.name) {
      const tooltip = next.tooltip.showing;

      if (tooltip && tooltip.name) {
        Animated.spring(this.state.scale, {
          toValue: 1,
          delay: 0,
          useNativeDriver: true,
          velocity: 25,
          friction: 10
        }).start();
        Animated.spring(this.state.opacity, {
          toValue: 1,
          delay: 0,
          velocity: 25,
          friction: 10,
          useNativeDriver: true
        }).start();
      } else {
        this.setState({
          scale: new Animated.Value(0.0),
          x: new Animated.Value(0)
        });
      }
    }
  }

  initTooltipData(props) {
    helper.tooltips.forEach(tooltip => {
      this.props.actions.setTooltipData(helper.data[tooltip]);
    });

    setTimeout(() => {
      if (!props.auth.user) return;
      this.props.actions.setCurrentTooltip(props.auth.user.onboarding);
    }, 1100);
  }

  nextOnboarding() {
    const current = this.props.tooltip.showing.name;

    const index = this.props.tooltip.onboarding.findIndex(t => t === current);

    this.props.actions.showTooltip(null);

    if (index === this.step) {
      let inc = 1;
      if (
        this.props.tooltip.onboarding[index + 1] === 'shareTip' &&
        Platform.OS === 'android'
      ) {
        inc = 2;
      }
      this.step += inc;

      this.props.actions.tooltipReady(false);
      this.props.actions.setOnboardingStep(this.step);
    }
  }

  render() {
    const { auth } = this.props;
    if (!auth.user) return null;
    const tooltip = this.props.tooltip.showing;
    if (!tooltip || !tooltip.name) return null;
    if (!tooltip.parent) return null;
    let style = { opacity: this.state.opacity };
    let arrowStyle = [];
    let transform = [{ scale: this.state.scale }];

    const { parent } = tooltip;

    if (parent.y < fullHeight / 2) {
      tooltip.vertical = 'bottom';
    } else {
      tooltip.vertical = 'top';
    }

    if (tooltip.vertical === 'bottom') {
      transform = [...transform, { translateY: this.state.height / 2 }];
      style = {
        ...style,
        top: -10 + parent.y + parent.h + tooltip.verticalOffset - this.state.height / 2,
        transform
      };
      arrowStyle = [...arrowStyle, { top: Platform.OS === 'android' ? 5 : 4 }];
    }

    if (tooltip.vertical === 'top') {
      transform = [...transform, { translateY: -this.state.height / 2 }];
      style = {
        ...style,
        top: 10 + parent.y - this.state.height / 2 - tooltip.verticalOffset,
        transform
      };
      arrowStyle = [
        ...arrowStyle,
        styles.arrowBottom,
        { bottom: Platform.OS === 'ios' ? 9 : 5 }
      ];
    }

    if (tooltip.horizontal === 'right') {
      const offset = tooltip.horizontalOffset;
      const px = parent.w / 2 + parent.x + offset * 2;
      const o = fullWidth - px - TOOLTIP_MARGIN;

      const x = this.state.scale.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -TOOLTIP_WIDTH + TOOLTIP_WIDTH / 2 + o + TOOLTIP_MARGIN]
      });

      transform = [{ translateX: x }, ...transform];
      style = {
        ...style,
        left: px - TOOLTIP_WIDTH / 2 - TOOLTIP_MARGIN,
        transform
      };
      arrowStyle = [...arrowStyle, { right: fullWidth - px - TOOLTIP_MARGIN - 6 }];
    }

    if (tooltip.horizontal === 'left') {
      style = {
        ...style,
        left: parent.x + tooltip.horizontalOffset,
        transform
      };
      arrowStyle = [...arrowStyle, { left: 8 }];
    }

    if (tooltip.horizontal === 'center') {
      style = {
        ...style,
        width: tooltip.width,
        left: parent.x + parent.w / 2 - this.state.width / 2 + tooltip.horizontalOffset,
        transform
      };
      arrowStyle = [...arrowStyle, ...styles.arrowBottom, { left: this.state.width / 2 }];
    }

    const button = (
      <TouchableOpacity
        style={[styles.mediumButton, { borderColor: 'white' }]}
        onPress={this.nextOnboarding}
        underlayColor={blue}
      >
        <Text style={[styles.mediumButtonText, { color: 'white' }]}>Got It</Text>
      </TouchableOpacity>
    );
    const dismiss = helper.data[tooltip.name].noButton || false;

    return (
      <TouchableHighlight
        style={styles.overlay}
        onPress={dismiss ? this.nextOnboarding : null}
        underlayColor={blue}
        // pointerEvents={dismiss ? 'all' : 'none'}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'hsla(0,0%,100%,0.3)',
            // backgroundColor: 'hsla(240,70%,50%,0.4)',
            opacity: this.state.opacity
          }}
          // pointerEvents={dismiss ? 'all' : 'none'}
        >
          <Animated.View
            style={[styles.tooltip, style]}
            onLayout={e => {
              const { width, height } = e.nativeEvent.layout;
              this.setState({ height, width });
            }}
          >
            <View style={[styles.arrow, ...arrowStyle]} />
            <TouchableHighlight
              style={styles.tooltipCard}
              onPress={this.nextOnboarding}
              underlayColor={blue}
            >
              <View>
                {helper.text[tooltip.name]({
                  ...this.props,
                  style: styles.tooltipText,
                  ...tooltip
                })}
                {helper.data[tooltip.name].noButton ? null : button}
              </View>
            </TouchableHighlight>
          </Animated.View>
        </Animated.View>
      </TouchableHighlight>
    );
  }
}

const localStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: fullWidth,
    height: fullHeight,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  tooltipCard: {
    backgroundColor: blue,
    padding: 15,
    paddingVertical: 20,
    paddingTop: 25,
    zIndex: 1000000,
    width: TOOLTIP_WIDTH
  },
  tooltip: {
    position: 'absolute',
    paddingVertical: 10
  },
  tooltipText: {
    fontSize: 15,
    lineHeight: 20,
    color: 'white'
  },
  arrow: {
    width: 10,
    height: 10,
    position: 'absolute',
    transform:
      Platform.OS === 'android'
        ? [{ rotate: '45deg' }]
        : [{ rotate: '35deg' }, { skewY: '45deg' }, { translateY: 3 }],
    backgroundColor: blue
  },
  arrowBottom: {
    shadowOffset: { width: 1, height: 1 }
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
    actions: bindActionCreators(
      {
        ...authActions,
        ...navigationActions,
        ...tooltipActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tooltip);
