import React, { Component } from 'react';
import {
  StyleSheet,
  NavigationExperimental,
  View,
  Animated,
} from 'react-native';

import { globalStyles } from '../../styles/global';
import CardHeader from './cardHeader.component';

const {
  Card: NavigationCard,
} = NavigationExperimental;

const {
  PagerPanResponder: NavigationPagerPanResponder,
  CardStackPanResponder: NavigationCardStackPanResponder,
  // PagerStyleInterpolator: NavigationPagerStyleInterpolator,
  CardStackStyleInterpolator: NavigationCardStackStyleInterpolator
} = NavigationCard;

let styles;

class Card extends Component {

  constructor(props, context) {
    super(props, context);
    this.getAnimatedStyle = this.getAnimatedStyle.bind(this);
  }

  getAnimatedStyle(props, type) {
    const {
      layout,
      position,
      scene,
    } = props;

    const { index } = scene;

    const inputRange = [index - 1, index, index + 1];
    const width = layout.initWidth;
    const translateX = position.interpolate({
      inputRange,
      outputRange: [width, 0, -50],
    });

    const opacity = position.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [-0.0, 1, -0.0],
    });

    if (type === 'header') return { opacity };

    return {
      transform: [
        { translateX },
      ],
    };
  }

  render() {
    let props = this.props;
    let headers = [];
    let index = props.scene.index;

    // console.log('nav props', this.props);

    const scenes = props.scenes.map((scene, i) => {
      const sceneProps = {
        ...props,
        scene,
      };

      let cardTransitionStyle = this.getAnimatedStyle(sceneProps);
      // let cardTransitionStyle = NavigationCardStackStyleInterpolator.forHorizontal(sceneProps);

      let panHandlers = NavigationPagerPanResponder.forHorizontal({
        ...sceneProps,
        onNavigateBack: () => props.back(),
        // onNavigateForward: () => navigate('forward'),
      });


      // we have to change animation style for both top card and the previous card based
      // the top card's animation style
      let topScene = props.scenes[i + 1];
      let vertical;
      if (scene.route.direction === 'vertical' && !topScene) vertical = true;
      if (topScene && topScene.route.direction === 'vertical') vertical = true;

      if (vertical) {
        cardTransitionStyle = NavigationCardStackStyleInterpolator.forVertical(sceneProps);
        panHandlers = NavigationCardStackPanResponder.forVertical({
          ...sceneProps,
          onNavigateBack: () => props.back(),
          // onNavigateForward: () => navigate('forward'),
        });

        if (this.props.navigation) {
          if (this.props.navigation.createPost.index > 0) panHandlers = null;
        }
        panHandlers = {};
      }

      if (scene.index === 0 || scene.index !== props.scenes.length - 1) panHandlers = {};

      let renderHeader = props.header && scene.route.header !== false;

      let headerHeight = renderHeader ? 59 : 0;
      if (this.props.share) headerHeight = 43;

      const style = [
        styles.card,
        cardTransitionStyle,
        { flex: 1,
          paddingTop: headerHeight
        },
      ];

      let headerStyle = this.getAnimatedStyle(sceneProps, 'header');

      let bottomScene = props.scenes[i - 1];
      // console.log(props.scenes);
      // console.log('bottomScene ', bottomScene);
      if (bottomScene && bottomScene.route.header === false && !topScene) {
        headerStyle = [this.getAnimatedStyle(sceneProps)];
      }

      if (vertical) {
        headerStyle = NavigationCardStackStyleInterpolator.forVertical(sceneProps);
      }

      if (props.header && scene.route.header !== false) {
        headers.push(
          <CardHeader
            key={scene.key}
            {...this.props}
            {...sceneProps}
            style={headerStyle}
            share={this.props.share}
            back={props.back}
            renderRight={props.renderRight}
          />);
      }

      return (
        <Animated.View
          key={scene.key}
          style={style}
          {...panHandlers}
        >
          {props.renderScene(sceneProps)}
        </Animated.View>
      );
    });

    return (
      <View style={{ flex: 1 }}>
        {headers}
        {scenes}
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
    shadowRadius: 4,
  }
});

styles = { ...localStyles, ...globalStyles };

export default Card;
