import React, { Component } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, headerHeight } from 'app/styles/global';
import CardHeader from './cardHeader.component';
import NavPanResponder from './navPanResponder';

let styles;

class Card extends Component {
  static propTypes = {
    scroll: PropTypes.bool,
    share: PropTypes.bool,
    style: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.getAnimatedStyle = this.getAnimatedStyle.bind(this);
    this.getAnimatedStyleVertical = this.getAnimatedStyleVertical.bind(this);
  }

  componentWillMount() {}

  getAnimatedStyle(props, type) {
    const { layout, position, scene } = props;

    const { index } = scene;

    const inputRange = [index - 1, index, index + 1];
    const width = layout.initWidth;
    const translateX = position.interpolate({
      inputRange,
      outputRange: [width, 0, -50]
    });

    const opacity = position.interpolate({
      inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
      outputRange: [0, 0.1, 1, 0.8, 0]
    });

    const opacityCard = position.interpolate({
      inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
      outputRange: [0, 1, 1, 0.6, 0]
    });

    if (type === 'header') return { opacity };

    return {
      transform: [{ translateX }],
      opacity: opacityCard
    };
  }

  getAnimatedStyleVertical(props) {
    const { layout, position, scene } = props;

    const { index } = scene;

    const inputRange = [index - 1, index, index + 1];
    const height = layout.initHeight;

    const translateX = 0;
    const translateY = position.interpolate({
      inputRange,
      outputRange: [height, 0, 0]
    });

    const opacity = position.interpolate({
      inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
      outputRange: [0, 1, 1, 0.6, 0]
    });

    const scale = position.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [1, 1, 0.97]
    });

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity
    };
  }

  render() {
    const { props } = this;
    const headers = [];

    const scenes = props.scenes.map((scene, i) => {
      const sceneProps = {
        ...props,
        scene
      };

      let cardTransitionStyle = this.getAnimatedStyle(sceneProps);

      const panDistance = sceneProps.scene.route.gestureResponseDistance || fullWidth;

      const scrolling = this.props.scroll;

      let panHandlers = NavPanResponder.forHorizontal({
        ...sceneProps,
        scrolling,
        gestureResponseDistance: panDistance,
        onNavigateBack: () => props.back()
      });

      // we have to change animation style for both top card and the previous card based
      // the top card's animation style
      const topScene = props.scenes[i + 1];
      let vertical;
      if (scene.route.direction === 'vertical' && !topScene) vertical = true;
      if (topScene && topScene.route.direction === 'vertical') vertical = true;

      if (vertical) {
        cardTransitionStyle = this.getAnimatedStyleVertical(sceneProps);
        panHandlers = NavPanResponder.forVertical({
          ...sceneProps,
          scrolling,
          gestureResponseDistance: fullWidth,
          onNavigateBack: () => props.back()
        });

        panHandlers = {};
      }

      if (scene.index === 0 || scene.index !== props.scenes.length - 1) panHandlers = {};

      const renderHeader = props.header && scene.route.header !== false;

      let paddingTop = renderHeader ? headerHeight : 0;
      if (this.props.share) paddingTop = 44;

      const style = [styles.card, cardTransitionStyle, { flex: 1, paddingTop }];

      let headerStyle = this.getAnimatedStyle(sceneProps, 'header');

      const bottomScene = props.scenes[i - 1];
      if (bottomScene && bottomScene.route.header === false && !topScene) {
        headerStyle = [this.getAnimatedStyle(sceneProps)];
      }

      if (vertical) {
        headerStyle = this.getAnimatedStyleVertical(sceneProps);
      }

      if (props.header && scene.route.header !== false) {
        headers.push(
          <CardHeader
            key={scene.key}
            {...this.props}
            {...props}
            {...sceneProps}
            style={[headerStyle]}
            share={this.props.share}
            back={props.back}
            renderRight={props.renderRight ? p => props.renderRight(p) : null}
          />
        );
      }

      return (
        <Animated.View key={scene.key} style={style} {...panHandlers}>
          {props.renderScene(sceneProps)}
        </Animated.View>
      );
    });

    return (
      <View style={[{ flex: 1, backgroundColor: 'black' }, this.props.style]}>
        {scenes}
        {headers}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  card: {
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    top: 0,
    backgroundColor: 'white'
  },
  headerBg: {
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    zIndex: 2,
    height: 59,
    backgroundColor: 'white'
  },
  headerShadow: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 4
  }
});

styles = { ...localStyles, ...globalStyles };

export default Card;
