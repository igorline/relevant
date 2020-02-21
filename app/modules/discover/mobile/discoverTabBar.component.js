import React, { Component } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

let styles;

class DefaultTabBar extends Component {
  static propTypes = {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    textStyle: PropTypes.object,
    tabStyle: PropTypes.object,
    renderTab: PropTypes.func,
    underlineStyle: PropTypes.object,
    initialTab: PropTypes.number,
    scrollValue: PropTypes.object,
    containerWidth: PropTypes.number,
    renderBadge: PropTypes.func,
    style: PropTypes.object
  };

  static defaultProps = {
    inactiveTextColor: 'black',
    backgroundColor: null
  };

  constructor(props) {
    super(props);
    this.nonNativeScroll = new Animated.Value(props.initialTab);
    props.scrollValue.addListener(
      Animated.event(
        [
          {
            value: this.nonNativeScroll
          }
        ],
        { useNativeDriver: false }
      )
    );
  }

  renderTab(name, page, isTabActive, onPressHandler, textColor) {
    const { textStyle } = this.props;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (
      <TouchableOpacity
        style={styles.flexOne}
        key={name}
        accessible
        accessibilityLabel={name}
        accessibilityTraits={'button'}
        onPress={() => onPressHandler(page)}
      >
        <View style={[styles.tab, this.props.tabStyle]}>
          <View>
            <Animated.Text style={[{ color: textColor, fontWeight }, textStyle]}>
              {name}
            </Animated.Text>
            {this.props.renderBadge(name)}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      containerWidth,
      backgroundColor,
      scrollValue,
      style,
      activeTab,
      goToPage
    } = this.props;

    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0
    };

    const left = scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, containerWidth / numberOfTabs]
    });

    return (
      <View style={[styles.tabs, { backgroundColor }, style]}>
        {this.props.tabs.map((name, page) => {
          const inputRange = [0, 1, 2];
          const outputRange = inputRange.map(i => (i === page ? 1 : 0));

          const textColor = this.nonNativeScroll
            .interpolate({
              inputRange,
              outputRange
            })
            .interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(35, 31, 32, 1)', 'rgba(77, 78, 255, 1)']
            });
          const isTabActive = activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab.bind(this);
          return renderTab(name, page, isTabActive, goToPage, textColor);
        })}
        <Animated.View
          style={[
            tabUnderlineStyle,
            { transform: [{ translateX: left }] },
            this.props.underlineStyle
          ]}
        />
      </View>
    );
  }
}

styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10
  },
  flexOne: {
    flex: 1
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around'
    // borderWidth: StyleSheet.hairlineWidth,
    // borderTopWidth: 0,
    // borderLeftWidth: 0,
    // borderRightWidth: 0,
    // borderColor: '#ccc'
  }
});

module.exports = DefaultTabBar;
