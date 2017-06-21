import React, { Component } from 'react';
import {
  StyleSheet,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import Tabs from '../tabs.component';

let styles;

export default class DiscoverHeader extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchTerm: null,
      transY: new Animated.Value(0),
      offsetY: new Animated.Value(0),
    };
    this.headerHeight = 50;
    this.lastOffset = -50;
    this.onScroll = this.onScroll.bind(this);
    this.currentOffset = -50;
  }

  onScroll(event) {
    this.currentOffset = event.nativeEvent.contentOffset.y;
    let threshold = Platform.OS === 'android' ? 0 : -this.headerHeight;
    if (!event.nativeEvent.contentSize.height || this.currentOffset <= threshold) {
      this.state.offsetY.setValue(0);
      return;
    }

    let diff = this.lastOffset - this.currentOffset;

    let top = Math.max(this.state.offsetY._value + diff, -this.headerHeight);
    top = Math.min(top, 0);

    this.state.offsetY.setValue(top);
    this.lastOffset = this.currentOffset;

    clearTimeout(this.scrollEnd);
    this.scrollEnd = setTimeout(() => this.onScrollEnd(), 100);
  }

  onScrollEnd() {
    if (this.state.offsetY._value >= -this.headerHeight / 2) {
      this.showHeader();
    } else this.hideHeader();
  }

  hideHeader() {
    const moveHeader = this.headerHeight * -1;
    Animated.timing(
      this.state.offsetY,
      {
        toValue: moveHeader,
        duration: 200,
        easing: Easing.quad,
        useNativeDriver: true,
      }
     ).start();
  }

  showHeader() {
    Animated.timing(
      this.state.offsetY,
      {
        toValue: 0,
        duration: 200,
        easing: Easing.quad,
        useNativeDriver: true,
      }
     ).start();
  }

  render() {
    // return this.props.children;
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          width: fullWidth,
          zIndex: 1000,
          backgroundColor:
          'white',
          transform: [{ translateY: this.state.offsetY }],
          overflow: 'hidden',
        }}
        ref={(c) => { this.header = c; }}
        onLayout={
          (event) => {
            const { height } = event.nativeEvent.layout;
            if (this.headerHeight === height) return;
            this.headerHeight = height;
            this.props.setPostTop(this.headerHeight);
            this.layout = true;
          }
        }
      >
        {this.props.children}
      </Animated.View>
    );
  }
}


const localStyles = StyleSheet.create({
  transformContainer: {
    overflow: 'hidden',
  },
  searchParent: {
    width: fullWidth,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    padding: 5,
  },
});

styles = { ...localStyles, ...globalStyles };
