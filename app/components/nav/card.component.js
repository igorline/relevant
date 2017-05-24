import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import * as NavigationExperimental from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/lib/views/CardStackStyleInterpolator';
import { globalStyles, fullWidth } from '../../styles/global';
import CardHeader from './cardHeader.component';
import NavPanResponder from './navPanResponder';

const {
  Card: NavigationCard,
} = NavigationExperimental;

// const {
  // PagerPanResponder: NavigationPagerPanResponder,
  // CardStackPanResponder: NavigationCardStackPanResponder,
  // PagerStyleInterpolator: NavigationPagerStyleInterpolator,
//   CardStackStyleInterpolator: NavigationCardStackStyleInterpolator
// } = NavigationCard;

// console.log(NavigationCard)
// console.log(NavigationExperimental)

let styles;

class Card extends Component {

  constructor(props, context) {
    super(props, context);
    this.getAnimatedStyle = this.getAnimatedStyle.bind(this);
    this.getAnimatedStyleVertical = this.getAnimatedStyleVertical.bind(this);
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
      inputRange: [
        index - 1,
        index - 0.99,
        index,
        index + 0.99,
        index + 1,
      ],
      outputRange: [0, 0.0, 1, 0.8, 0],
    });

    const opacityCard = position.interpolate({
      inputRange: ([
        index - 1,
        index - 0.99,
        index,
        index + 0.99,
        index + 1,
      ]),
      outputRange: ([1, 1, 1, 0.6, 0]),
    });

    if (type === 'header') return { opacity };

    return {
      transform: [
        { translateX },
      ],
      opacity: opacityCard
    };
  }

  getAnimatedStyleVertical(props) {
    const {
      layout,
      position,
      scene,
    } = props;

    const { index } = scene;

    const inputRange = [index - 1, index, index + 1];
    const height = layout.initHeight;

    const translateX = 0;
    const translateY = position.interpolate({
      inputRange,
      outputRange: ([height, 0, 0]),
    });

    const opacity = position.interpolate({
      inputRange: ([
        index - 1,
        index - 0.99,
        index,
        index + 0.99,
        index + 1,
      ]),
      outputRange: ([0, 1, 1, 0.6, 0]),
    });

    const scale = position.interpolate({
      inputRange: ([
        index - 1,
        index,
        index + 1,
      ]),
      outputRange: ([1, 1, 0.97]),
    });

    return {
      transform: [
        { translateX }, { translateY }, { scale }
      ],
      opacity
    };
  }

  render() {
    let props = this.props;
    let headers = [];
    let index = props.scene.index;

    const scenes = props.scenes.map((scene, i) => {
      const sceneProps = {
        ...props,
        scene,
      };

      let cardTransitionStyle = this.getAnimatedStyle(sceneProps);
      // let cardTransitionStyle = NavigationCardStackStyleInterpolator.forHorizontal(sceneProps);

      let panDistance = sceneProps.scene.route.gestureResponseDistance || fullWidth;

      let scrolling = this.props.scroll;
      // if (scrolling) panDistance = 50;

      let panHandlers = NavPanResponder.forHorizontal({
      // let panHandlers = NavigationPagerPanResponder.forHorizontal({
        ...sceneProps,
        scrolling,
        gestureResponseDistance: panDistance,
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
        // cardTransitionStyle = CardStackStyleInterpolator.forVertical(sceneProps);
        cardTransitionStyle = this.getAnimatedStyleVertical(sceneProps);
        // panHandlers = NavPanResponder.forVertical({
        panHandlers = NavPanResponder.forVertical({
          ...sceneProps,
          scrolling,
          gestureResponseDistance: fullWidth,
          onNavigateBack: () => props.back(),
          // onNavigateForward: () => navigate('forward'),
        });

        // if (this.props.navigation) {
        //   if (this.props.navigation.createPost.index > 0) panHandlers = null;
        // }
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
          paddingTop: headerHeight,
        },
      ];

      let headerStyle = this.getAnimatedStyle(sceneProps, 'header');

      let bottomScene = props.scenes[i - 1];
      if (bottomScene && bottomScene.route.header === false && !topScene) {
        headerStyle = [this.getAnimatedStyle(sceneProps)];
      }

      if (vertical) {
        headerStyle = this.getAnimatedStyleVertical(sceneProps);
        // headerStyle = CardStackStyleInterpolator.forVertical(sceneProps);
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
      <View style={[{ flex: 1, backgroundColor: 'black' }, this.props.style]}>
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
    backgroundColor: 'white',
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
