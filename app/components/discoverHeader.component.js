import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { globalStyles, fullWidth } from '../styles/global';
import Tags from './tags.component';
import Tabs from './tabs.component';

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
  }

  // componentDidMount() {
  //   // if (this.props.showHeader) this.showHeader();
  // }

  // componentWillReceiveProps(next) {
  //   // if (this.props.showHeader !== next.showHeader) {
  //   //   if (next.showHeader) this.showHeader();
  //   //   else this.hideHeader();
  //   // }
  //   // if (this.props.tags.selectedTags !== next.tags.selectedTags) {
  //   //   this.input.blur();
  //   // }
  // }

  onScroll(event) {
    this.currentOffset = event.nativeEvent.contentOffset.y;
    if (this.currentOffset <= -this.headerHeight) {
      this.state.offsetY.setValue(0);
      return;
    }
    // if (this.currentOffset < -1) {
    //   this.state.offsetY.setValue(0);
    //   return;
    // }

    let diff = this.lastOffset - this.currentOffset;

    let top = Math.max(this.state.offsetY._value + diff, -this.headerHeight);
    top = Math.min(top, 0);

    this.state.offsetY.setValue(top);
    this.lastOffset = this.currentOffset;

    clearTimeout(this.scrollEnd);
    this.scrollEnd = setTimeout(() => this.onScrollEnd(), 100);
  }

  onScrollEnd() {
    if (this.state.offsetY._value > -this.headerHeight / 2) {
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
        easing: Easing.quad
      }
     ).start();
  }

  showHeader() {
    // this.setState({ showHeader: true });
    Animated.timing(
      this.state.offsetY,
      {
        toValue: 0,
        duration: 200,
        easing: Easing.quad
      }
     ).start();
  }

  render() {
    let tags = (
      <View>
        <Tags actions={this.props.actions} tags={this.props.tags} />
      </View>
    );

    if (this.props.view === 2) {
      tags = null;
    }

    return (

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          backgroundColor:
          'white',
          transform: [{ translateY: this.state.offsetY }],
          overflow: 'hidden',
        }}
        ref={(c) => { this.header = c; }}
        onLayout={
          (event) => {
            const { height } = event.nativeEvent.layout;
            // TODO make sure this is efficient
            // if (!this.layout) {
            if (this.headerHeight === height) return;
            this.headerHeight = height;
            this.props.setPostTop(this.headerHeight);
            this.layout = true;
            // this.onScroll(event);
            // }
          }
        }
      >
        {tags}
        <Tabs
          tabs={this.props.tabs}
          active={this.props.view}
          handleChange={this.props.changeView}
        />
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
